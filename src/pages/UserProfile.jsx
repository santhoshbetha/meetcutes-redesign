import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Eye, Users, MapPin, Flag, ChevronLeft, ChevronRight, ShieldAlert, Settings } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { getUserProfile } from "@/services/user.service";
import { isObjEmpty } from "@/utils/util";
import { useAuth } from "@/context/AuthContext";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { UserProfileSkeleton } from "@/components/UserProfileSkeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const CDNURL = 'https://yrxymkmmfrkrfccmutvr.supabase.co/storage/v1/object/public/meetfirst/images';

// Configured Questionnaire Data Matrix maps for iterative rendering
const MALE_QUESTIONS = [
    { key: "q1", left: "Android", right: "iPhone" },
    { key: "q2", left: "Capitalism", right: "Equal Opportunities" },
    { key: "q3", left: "Truck", right: "BMW" },
    { key: "q4", left: "Socialism", right: "Pyramid Scheme" },
    { key: "q5", left: "Modern Family", right: "Traditional Family" },
    { key: "q6", left: "Suit/Formal dress", right: "Jeans and T-shirt" },
    { key: "q7", left: "Partner", right: "Title Wife" },
    { key: "q8", left: "Concerts/Clubs", right: "Movie at home" },
    { key: "q9", left: "End goal Happiness", right: "End goal Family/kids" },
    { key: "q10", left: "Credit card", right: "Cash/Debit card" },
];

const FEMALE_QUESTIONS = [
    { key: "q1", left: "Android", right: "iPhone" },
    { key: "q2", left: "Trader Joe's", right: "ALDI/WINCO" },
    { key: "q3", left: "Tesla", right: "Toyota" },
    { key: "q4", left: "Costco", right: "Whole Foods" },
    { key: "q5", left: "Woman Rights", right: "Transwoman is woman" },
    { key: "q6", left: "Pro-Choice", right: "Pro-Life" },
    { key: "q7", left: "KOHL'S", right: "NORDSTROM" },
    { key: "q8", left: "Enchanted (film)", right: "Barbie (film)" },
    { key: "q9", left: "Power Couple", right: "Traditional Relationship" },
    { key: "q10", left: "Concerts/Clubs", right: "Movie at home" },
    { key: "q11", left: "Title Husband", right: "Partner" },
    { key: "q12", left: "End goal Happiness", right: "End goal Family/kids" },
    { key: "q13", left: "Credit card", right: "Cash/Debit card" },
    { key: "q14", left: "Dog Mom/Cat Mom", right: "Pet Owner" },
];

export function UserProfile() {
    const { userid } = useParams();
    const navigate = useNavigate();
    const { userSession } = useAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageUseCover, setImageUseCover] = useState({});
    const carouselRef = useRef(null);

    // Sync route validation gates
    useEffect(() => {
        if (userSession === null) {
            navigate('/');
        }
    }, [userSession, navigate]);

    // Pull profile targets remotely
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await getUserProfile(userid);
                if (response.success) {
                    setUserData(response.data);
                } else {
                    setError(response.msg || 'User profile not found in directory');
                }
            } catch {
                setError('Failed to load user profile context');
            } finally {
                setLoading(false);
            }
        };

        if (userid) fetchUserProfile();
    }, [userid]);

    // Clean parsed image array blocks
    const validImages = useMemo(() => {
        return userData?.images?.filter(img => img && typeof img === 'string' && img.trim() !== '') || [];
    }, [userData?.images]);

    const hasImages = validImages.length > 0;

    // Safe background gradient generator
    const dummyAvatarStyles = useMemo(() => {
        if (!userData) return "";
        const colors = [
            'from-blue-400 to-blue-600', 'from-purple-400 to-purple-600',
            'from-green-400 to-green-600', 'from-pink-400 to-pink-600',
            'from-orange-400 to-orange-600', 'from-teal-400 to-teal-600',
            'from-indigo-400 to-indigo-600', 'from-red-400 to-red-600'
        ];
        const patterns = ['bg-gradient-to-br', 'bg-gradient-to-tr', 'bg-gradient-to-bl', 'bg-gradient-to-tl'];

        const colorIndex = (userData.firstname?.charCodeAt(0) || 0) % colors.length;
        const patternIndex = (userData.age || 0) % patterns.length;
        return `${patterns[patternIndex]} ${colors[colorIndex]}`;
    }, [userData]);

    const nextImage = () => {
        if (!validImages.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    };

    const prevImage = () => {
        if (!validImages.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    const onImageLoad = (index, e) => {
        try {
            const nw = e.target.naturalWidth || 0;
            const nh = e.target.naturalHeight || 0;
            const rect = carouselRef.current?.getBoundingClientRect();
            const cw = rect?.width || 720;
            const ch = rect?.height || 420;
            const useCover = nw < cw * window.devicePixelRatio || nh < ch * window.devicePixelRatio;
            setImageUseCover((prev) => ({ ...prev, [index]: useCover }));
        } catch (err) {
            // safe fallback pass
        }
    };

    // Safe fallback resolver for nested questionnaire targets
    const getQuestionValue = (key) => {
        return [userData?.questionairevalues?.[key] ?? 20];
    };

    const reportUser = () => {
        // 1. Point explicitly to userData (the person being viewed)
        const targetUserId = userData?.userid || "Unknown ID";
        const targetUserName = `${userData?.firstname || ''} ${userData?.lastname || ''}`.trim();

        const supportEmail = "hello@meetcutes.us"; // 2. Explicit destination mail box
        const subject = encodeURIComponent(`Report User: ${targetUserName}`);

        // 3. Swapped \n for %0A to guarantee clean line breaking alignment across native mail apps
        const body = encodeURIComponent(
            `Reporting User Name: ${targetUserName}\n` +
            `Reporting User ID: ${targetUserId}\n\n` +
            `Please provide specific details about the violation or issue below:\n- `
        );

        const mailtoLink = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
    };


    if (loading) return <UserProfileSkeleton />;

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-lg border border-border">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Profile Not Found</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {error || 'The user profile you are looking for does not exist or is not accessible.'}
                        </p>
                        <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeQuestionSet = userData.gender === 'Male' ? MALE_QUESTIONS : FEMALE_QUESTIONS;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 space-y-8">

                {/* Flag Action Button Link */}
                <button
                    title="Flag user node context"
                    onClick={reportUser}
                    className="absolute right-4 top-4 p-2 rounded-xl bg-card hover:bg-muted/50 border border-border shadow-xs transition-colors cursor-pointer"
                >
                    <Flag className="w-4 h-4 text-destructive" />
                </button>

                {/* Global Intro Header Title Block */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <Eye className="w-3.5 h-3.5" /> User Profile
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                        {userData.firstname} {userData.lastname}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                        View profile preferences and establish structural connections
                    </p>
                </div>

                {/* Large Media Gallery Carousel Block Container */}
                {hasImages && (
                    <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-border">
                        <div ref={carouselRef} className="w-full max-w-[720px] h-[360px] sm:h-[440px] md:h-[500px] mx-auto relative bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">

                            <div className="relative w-full h-full flex items-center justify-center">
                                {validImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                                            }`}
                                    >
                                        <img
                                            src={image.startsWith('http') ? image : `${CDNURL}/${userData.shortid || userData.userid || ''}/${image}`}
                                            alt={`${userData.firstname} - Visual File node attachment index ${index + 1}`}
                                            className={`max-w-full max-h-full ${imageUseCover[index] ? 'object-cover w-full h-full' : 'object-contain'}`}
                                            onLoad={(e) => onImageLoad(index, e)}
                                            onError={(e) => { e.target.src = "/professional-headshot-of-a-young-man-with-brown-ha.jpg"; }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Controls */}
                            {validImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all active:scale-95"
                                        aria-label="Previous image block element"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all active:scale-95"
                                        aria-label="Next image block element"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                                        {validImages.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex ? "bg-white w-3" : "bg-white/40 hover:bg-white/70"
                                                    }`}
                                                aria-label={`Navigate indicator slot ${index + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/50 text-white text-xs font-bold tracking-wide rounded-full z-20 font-mono">
                                        {currentImageIndex + 1} / {validImages.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Informational Presentation Layout Split grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 md:gap-8 items-start">

                    {/* AVATAR SUMMARY COLUMN */}
                    <Card className="shadow-lg border border-border bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-md">
                        <CardContent className="p-6 text-center space-y-4">

                            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/10 shadow-md mx-auto bg-muted">
                                {validImages[0] ? (
                                    <img
                                        src={validImages[0].startsWith('http') ? validImages[0] : `${CDNURL}/${userData.shortid || userData.userid || ''}/${validImages[0]}`}
                                        alt={`${userData.firstname} avatar frame node asset`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = '/professional-headshot-of-a-young-man-with-brown-ha.jpg'; }}
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center relative font-bold text-white text-2xl ${dummyAvatarStyles}`}>
                                        {userData.firstname?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-lg font-bold tracking-tight text-foreground">{userData.firstname} {userData.lastname}</h2>
                                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    <span>{userData.city || "NA"}, {userData.state || "NA"}</span>
                                </div>
                                {!isObjEmpty(userData.userhandle) && (
                                    <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-transparent font-mono text-xs">
                                        @{userData.userhandle}
                                    </Badge>
                                )}
                            </div>

                            <div className="pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {userData.visibilityPreference === 'events-only' ? (
                                    <><Calendar className="w-3.5 h-3.5 text-primary" /> <span>Events Node</span></>
                                ) : userData.visibilityPreference === 'online-only' ? (
                                    <><Users className="w-3.5 h-3.5 text-primary" /> <span>Online Mode</span></>
                                ) : (
                                    <><Eye className="w-3.5 h-3.5 text-primary" /> <span>Ubiquitous visibility</span></>
                                )}
                            </div>

                        </CardContent>
                    </Card>

                    {/* ATTRIBUTES INFO DETAILS COLUMN */}
                    <div className="space-y-6">

                        {/* Contact Parameters block card */}
                        <Card className="shadow-md border border-border bg-card/80">
                            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                                    </Label>
                                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 text-sm font-semibold text-foreground/90 break-all select-all">
                                        {userData.email || "No contact email exposed"}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-primary" /> Phone Line
                                    </Label>
                                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 text-sm font-semibold text-foreground/90 select-all">
                                        {userData.phonenumber || 'Not provided'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social handles matrix grid card */}
                        <Card className="shadow-md border border-border bg-card/80">
                            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><FaFacebook className="text-blue-600 w-3.5 h-3.5" /> Facebook</Label>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/40 text-xs font-medium text-foreground/80 truncate">{userData.facebook || 'Not connected'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><FaInstagram className="text-pink-600 w-3.5 h-3.5" /> Instagram</Label>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/40 text-xs font-medium text-foreground/80 truncate">{userData.instagram || 'Not connected'}</div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><FaLinkedin className="text-blue-700 w-3.5 h-3.5" /> LinkedIn</Label>
                                    <div className="p-3 bg-muted/30 rounded-xl border border-border/40 text-xs font-medium text-foreground/80 truncate">{userData.linkedin || 'Not connected'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Bio Card */}
                        {!isObjEmpty(userData.bio) && (
                            <Card className="shadow-md border border-border bg-card/80">
                                <CardContent className="p-6 space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Biography Profile Statement</Label>
                                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{userData.bio}</p>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>

                {/* QUESTIONNAIRE ACCORDION METRIC MATRIX LAYER */}
                {userData.questionairevaluesset && userData.questionairevalues && (
                    <div className="w-full pt-2">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="questionnaire" className="border border-border rounded-xl shadow-md bg-card/90 overflow-hidden">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline transition-colors hover:bg-muted/10">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-foreground">Questionnaire Values</h3>
                                            <p className="text-xs text-muted-foreground">Comparative matrix positioning preferences mapping details</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 pt-2">

                                    {/* Clean iterated optimized list matrix render */}
                                    <div className="space-y-5">
                                        {activeQuestionSet.map((question) => (
                                            <div key={question.key} className="grid grid-cols-12 gap-4 items-center py-1">
                                                <div className="col-span-3 text-xs sm:text-sm font-semibold text-foreground truncate text-left">
                                                    {question.left}
                                                </div>
                                                <div className="col-span-6 px-1">
                                                    <Slider
                                                        value={getQuestionValue(question.key)}
                                                        max={100}
                                                        step={1}
                                                        disabled
                                                        className="pointer-events-none opacity-85"
                                                    />
                                                </div>
                                                <div className="col-span-3 text-xs sm:text-sm font-semibold text-muted-foreground truncate text-right">
                                                    {question.right}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}

            </div>
        </div>
    );
}