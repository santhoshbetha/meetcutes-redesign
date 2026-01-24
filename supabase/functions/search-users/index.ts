import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SearchRequest {
    gender: string;
    agefrom: number;
    ageto: number;
    lat: number;
    long: number;
    searchdistance: number;
    page: number;
    limit: number;
    ethnicity?: string[];
}

interface SearchResponse {
    users: any[];
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
            gender,
            agefrom,
            ageto,
            lat,
            long,
            searchdistance,
            page,
            limit,
            ethnicity,
        }: SearchRequest = await req.json();

        // Validate required parameters
        if (
            !gender || !lat || !long || !searchdistance || page === undefined ||
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

        // Build the query with distance filtering
        const { data, error, count } = await supabaseClient
            .from("users")
            .select(
                `
                    userid, 
                    firstname, 
                    lastname, 
                    age, 
                    userhandle, 
                    gender, 
                    city, 
                    state, 
                    ethnicity, 
                    timeoflogin, 
                    email, 
                    phonenumber, 
                    facebook, 
                    instagram, 
                    linkedin, 
                    latitude, 
                    longitude, 
                    bio,
                    userstate,
                    idverified,
                    images,
                    visibilitypreference
                `,
                { count: "exact" },
            )
            .eq("userstate", "active")
            .neq("visibilitypreference", "events-only")
            .gte("age", agefrom)
            .lte("age", ageto)
            .neq("gender", gender) // Search for opposite gender
            .not("latitude", "is", null)
            .not("longitude", "is", null)
            .order("timeoflogin", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Database error:", error);
            return new Response(
                JSON.stringify({ error: "Database query failed" }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // Filter results by distance using haversine calculation
        let filteredByDistance = (data || []).filter((user) => {
            if (!user.latitude || !user.longitude) return false;

            // Calculate distance using haversine formula (in meters)
            const R = 6371000; // Earth's radius in meters
            const dLat = (user.latitude - lat) * Math.PI / 180;
            const dLon = (user.longitude - long) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * Math.PI / 180) *
                    Math.cos(user.latitude * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in meters

            return distance <= searchdistance;
        });

        const totalResults = count || 0;
        const hasMore = offset + limit < totalResults;

        const response: SearchResponse = {
            users: filteredByDistance,
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
