import { useState } from "react";
import QRPayPal from "@/assets/QRPayPal.png";
import { Container } from "@/components/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, Users, Lightbulb, Coffee, Star } from "lucide-react";

export function Donate() {
  const [qrImg, SetQrImg] = useState(QRPayPal);

  const donationReasons = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Help More People Connect",
      description: "Your donation helps us maintain and improve the platform for genuine connections"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Support Innovation",
      description: "Fund new features and improvements that make meeting people easier and safer"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Keep it Free",
      description: "Help us maintain our commitment to providing meaningful connections without cost"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Container className="py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Support MeetCutes
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Help Us Grow
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            MeetCutes operates as a non-profit platform with negative costs. Your support helps us
            maintain and improve our mission of creating meaningful connections.
          </p>
        </div>

        {/* Main Donation Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-3xl md:text-4xl text-emerald-900 dark:text-emerald-100 mb-4">
                Make a Donation
              </CardTitle>
              <p className="text-lg text-emerald-900/80 dark:text-emerald-100/80 leading-relaxed">
                Every contribution, no matter the size, helps us continue our mission of bringing
                people together through authentic, meaningful connections.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* PayPal Button */}
              <div className="text-center">
                <form
                  action="https://www.paypal.com/donate"
                  method="post"
                  target="_blank"
                  className="inline-block"
                >
                  <input
                    type="hidden"
                    name="hosted_button_id"
                    value="2CBVQ367ZGLPC"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Donate via PayPal
                  </Button>
                  <img
                    alt=""
                    border="0"
                    src="https://www.paypal.com/en_US/i/scr/pixel.gif"
                    width="1"
                    height="1"
                  />
                </form>
              </div>

              {/* QR Code */}
              <div className="text-center space-y-4">
                <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <img
                    className="w-48 h-48 border-4 border-gray-100 dark:border-gray-600 rounded-xl"
                    src={qrImg}
                    alt="PayPal QR Code"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan QR code with your phone's camera or PayPal app
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Donate Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {donationReasons.map((reason, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary">
                    {reason.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact Section */}
        <Card className="shadow-xl border-0 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-amber-900 dark:text-amber-100">
              Your Impact Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Coffee className="w-6 h-6 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Server Costs</h4>
                    <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                      Help cover hosting and maintenance expenses
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Community Growth</h4>
                    <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                      Support features that help more people connect
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Innovation</h4>
                    <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                      Fund new features and platform improvements
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">Free Access</h4>
                    <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                      Keep MeetCutes accessible to everyone
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">🙏 Thank You</h4>
              <p className="text-amber-900/80 dark:text-amber-100/80">
                Your generosity helps us maintain our commitment to creating a platform where genuine,
                meaningful connections can flourish. Every donation makes a real difference.
              </p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
