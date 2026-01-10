import { useState } from "react";
import QRPayPal from "@/assets/QRPayPal.png";
import { Container } from "@/components/Container";

export function Donate() {
  const [qrImg, SetQrImg] = useState(QRPayPal);

  return (
    <Container className="mt-3" variant="fullMobileBreakpointPadded">
      <section className="dark:bg-blue-950/20 rounded-2xl p-6 md:p-8 shadow-sm border border-blue-100 dark:border-blue-900/30">
        <h2 className="text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
          Donate
        </h2>
        <div className="space-y-3 text-sm md:text-base text-blue-900/90 dark:text-blue-100/90 leading-relaxed">
          <h5 className="scroll-m-20 text-lg font-semibold tracking-tight">
            We are running this app non profit with negative costs. If you like
            to support this app and help it run and appreciate it, you may
            donate via below button or QR code:
          </h5>
          <div className="mt-3">
            <form
              action="https://www.paypal.com/donate"
              method="post"
              target="_blank"
            >
              <input
                type="hidden"
                name="hosted_button_id"
                value="2CBVQ367ZGLPC"
              />
              <input
                type="image"
                src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
                border="0"
                name="submit"
                title="PayPal - The safer, easier way to pay online!"
                alt="Donate with PayPal button"
              />
              <img
                alt=""
                border="0"
                src="https://www.paypal.com/en_US/i/scr/pixel.gif"
                width="1"
                height="1"
              />
            </form>
          </div>
          <p className="ms-4">OR</p>
          <div className="border-0 p-0">
            <img className="w-50 border-3 p-3" src={qrImg} alt="" />
          </div>
        </div>
      </section>
    </Container>
  );
}
