import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SearchRequest {
    lat: number;
    long: number;
    searchdistance: number;
    startdate: string;
    enddate?: string;
    page: number;
    limit: number;
}

interface SearchResponse {
    events: any[];
    hasMore: boolean;
    total: number;
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: {
                        Authorization: req.headers.get("Authorization")!,
                    },
                },
            },
        );

        const {
            lat,
            long,
            searchdistance,
            startdate,
            enddate,
            page,
            limit,
        }: SearchRequest = await req.json();

        // Validate required parameters
        if (
            !lat || !long || !searchdistance || !startdate ||
            page === undefined ||
            !limit
        ) {
            return new Response(
                JSON.stringify({ error: "Missing required parameters" }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const offset = page * limit;

        // Use RPC function based on whether enddate is provided
        let rpcFunction, rpcParams;
        if (enddate) {
            rpcFunction = "get_events_by_distance_range";
            rpcParams = {
                lat,
                long,
                distance: searchdistance,
                startdate,
                enddate,
            };
        } else {
            rpcFunction = "get_events_by_distance_date";
            rpcParams = {
                lat,
                long,
                distance: searchdistance,
                startdate,
            };
        }

        // Get events data with pagination
        const { data: eventsData, error: eventsError } = await supabaseClient
            .rpc(
                rpcFunction,
                rpcParams,
            );

        if (eventsError) {
            console.error("Events RPC error:", eventsError);
            return new Response(
                JSON.stringify({ error: "Failed to fetch events" }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // Apply pagination to the results
        const paginatedEvents = (eventsData || []).slice(
            offset,
            offset + limit,
        );

        // Get location data for the events
        const locationIds = paginatedEvents.map((event) => event.locationid)
            .filter((id) => id);

        let eventsWithLocations = paginatedEvents;
        if (locationIds.length > 0) {
            const { data: locationsData, error: locationsError } =
                await supabaseClient
                    .from("locations")
                    .select(
                        "locationid, locationname, address1, state, city, zipcode",
                    )
                    .in("locationid", locationIds);

            if (!locationsError && locationsData) {
                // Combine events with location data
                eventsWithLocations = paginatedEvents.map((event) => {
                    const location = locationsData.find((loc) =>
                        loc.locationid === event.locationid
                    );
                    return {
                        ...event,
                        locationdata: location || null,
                    };
                });
            }
        }

        const totalResults = (eventsData || []).length;
        const hasMore = offset + limit < totalResults;

        const response: SearchResponse = {
            events: eventsWithLocations,
            hasMore,
            total: totalResults,
        };

        return new Response(
            JSON.stringify(response),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Edge function error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
