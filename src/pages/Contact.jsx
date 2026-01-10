import { useState } from "react";
import QRPayPal from "@/assets/QRPayPal.png";
import { Container } from "@/components/Container";

export function Contact() {
  const [qrImg, SetQrImg] = useState(QRPayPal);

  return (
    <Container className="mt-3" variant="fullMobileBreakpointPadded">
      <section className="dark:bg-blue-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-blue-100 dark:border-blue-900/30">
        <h2 className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
          Contact us
        </h2>
        <div className="space-y-3 text-sm md:text-base text-blue-900/90 dark:text-blue-100/90 leading-relaxed">
          <h5 className="scroll-m-20 text-lg font-semibold tracking-tight">
            Write us your sugestions or queries to:
            <span className="text-green-700">&nbsp;contact@meetcutes.us</span>
          </h5>
          <h5 className="">
            Developers who would like to contribute to this project and enhance
            it may contact at
            <span className="text-green-700">
              &nbsp;developers@meetcutes.us
            </span>
          </h5>
          <h5 className="">
            People who would like to contribute to questionaire from experience
            in this web app or in general with knowledge on relationships, may
            contact at
            <span className="text-green-700">&nbsp;experts@meetcutes.us</span>
          </h5>
        </div>
      </section>
    </Container>
  );
}
