import { useEffect, useRef, useState } from "react";
import { PaymentWidgetInstance, loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import { useQuery } from "@tanstack/react-query";

const clientKey: string = process.env.NEXT_PUBLIC_CLIENT_KEY || "기본값"; 
const customerKey = nanoid();

export default function Home() {
  const { data: paymentWidget } = usePaymentWidget(clientKey, customerKey);


  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance["renderPaymentMethods"]> | null>(null);
  const agreementsWidgetRef = useRef<ReturnType<PaymentWidgetInstance["renderAgreement"]> | null>(null);
  const [price, setPrice] = useState(100);
  const [paymentMethodsWidgetReady, isPaymentMethodsWidgetReady] = useState(false);

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods("#payment-widget", { value: price }, { variantKey: "DEFAULT" });

    paymentWidget.renderAgreement("#agreement", {
      variantKey: "AGREEMENT",
    });

    paymentMethodsWidget.on("ready", () => {
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
      isPaymentMethodsWidgetReady(true);
    });
  }, [paymentWidget]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }

    // ------ 금액 업데이트 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#updateamount결제-금액
    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  return (
    <main>
      <div className="wrapper">
        <div className="box_section">
          <div id="payment-widget" style={{ width: "100%" }} />
          <div id="agreement" style={{ width: "100%" }} />
          <div style={{ paddingLeft: "24px" }}>
            <div className="checkable typography--p">
              <label htmlFor="coupon-box" className="checkable__label typography--regular">
                <input
                  id="coupon-box"
                  className="checkable__input"
                  type="checkbox"
                  aria-checked="true"
                  disabled={!paymentMethodsWidgetReady}
                  onChange={(event) => {
                    setPrice(event.target.checked ? price - 5_000 : price + 5_000);
                  }}
                />
                <span className="checkable__label-text">5,000원 쿠폰 적용</span>
              </label>
            </div>
          </div>

          <button
            className="button"
            style={{ marginTop: "30px" }}
            disabled={!paymentMethodsWidgetReady}
            onClick={async () => {
              try {

                await paymentWidget?.requestPayment({
                  orderId: nanoid(),
                  orderName: "토스 티셔츠 외 2건",
                  customerName: "김토스",
                  customerEmail: "customer123@gmail.com",
                  customerMobilePhone: "01012341234",
                  successUrl: `${window.location.origin}/success`,
                  failUrl: `${window.location.origin}/fail`,
                });
              } catch (error) {
                // 에러 처리하기
                console.error(error);
              }
            }}
          >
            결제하기
          </button>
        </div>
      </div>
    </main>
  );
}

function usePaymentWidget(clientKey: string, customerKey: string) {
  return useQuery({
    queryKey: ["payment-widget", clientKey, customerKey],
    queryFn: () => {

      return loadPaymentWidget(clientKey, customerKey);
    },
  });
}