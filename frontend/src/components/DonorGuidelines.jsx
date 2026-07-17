import { Link } from 'react-router-dom';
import DonorNavbar from './layout/DonorNavbar';
import DonorFooter from './layout/DonorFooter';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-serif italic text-[28px] md:text-[36px] text-[#BE1F2E] mb-4">{title}</h2>
    <div className="space-y-3 text-[15px] md:text-[16px] text-[#5A5A5A] leading-relaxed">
      {children}
    </div>
  </div>
);

const CheckItem = ({ children }) => (
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-[#22A06B] text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
    <span>{children}</span>
  </div>
);

const XItem = ({ children }) => (
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-[#BE1F2E] text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
    <span>{children}</span>
  </div>
);

const DonorGuidelines = () => {
  return (
    <div className="bg-[#fbf9f6] text-[#1b1c1a] min-h-screen" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <DonorNavbar />

      <main className="pt-28 pb-24 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-10">
        <header className="mb-14">
          <p className="text-[12px] font-[600] uppercase tracking-widest text-[#BE1F2E] mb-4">RaktSetu Medical Guidelines</p>
          <h1
            className="font-serif italic leading-none tracking-[-0.03em] text-[#1A0A0A] mb-6"
            style={{ fontSize: 'clamp(40px, 7vw, 80px)' }}
          >
            Donor<br/>Guidelines
          </h1>
          <p className="text-[#737373] text-[16px] md:text-[18px] max-w-2xl leading-relaxed">
            Safe donation begins with informed donors. Please read these guidelines carefully before booking your next donation appointment. Your health and the health of recipients depend on it.
          </p>
        </header>

        <div className="bg-white border border-[rgba(26,18,16,0.09)] rounded-xl p-6 md:p-10 shadow-sm space-y-12">

          {/* Basic Eligibility */}
          <Section title="Basic Eligibility">
            <CheckItem>Age: 18 to 65 years old</CheckItem>
            <CheckItem>Weight: Minimum 45 kg (99 lbs)</CheckItem>
            <CheckItem>Haemoglobin: ≥ 12.5 g/dL for women, ≥ 13.0 g/dL for men</CheckItem>
            <CheckItem>Blood pressure: Systolic 100–180 mmHg, Diastolic 50–100 mmHg</CheckItem>
            <CheckItem>Pulse rate: 60–100 beats/min</CheckItem>
            <CheckItem>Temperature: Normal (up to 37.5 °C / 99.5 °F)</CheckItem>
          </Section>

          {/* Donation Frequency */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10">
            <Section title="Donation Frequency">
              <CheckItem>Whole blood: Once every <strong>3 months</strong> (90 days)</CheckItem>
              <CheckItem>Platelets (Apheresis): Once every 2 weeks, up to 24 times/year</CheckItem>
              <CheckItem>Plasma: Once every 4 weeks</CheckItem>
              <CheckItem>Double red cells: Once every 16 weeks</CheckItem>
            </Section>
          </div>

          {/* What to Do Before Donation */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10">
            <Section title="Before Your Donation">
              <CheckItem>Get a good night's sleep (at least 7–8 hours)</CheckItem>
              <CheckItem>Drink plenty of fluids — at least 500ml of water before arrival</CheckItem>
              <CheckItem>Eat a healthy iron-rich meal 2–3 hours before donating</CheckItem>
              <CheckItem>Wear comfortable clothing with sleeves that roll up easily</CheckItem>
              <CheckItem>Carry a valid ID proof to the donation centre</CheckItem>
            </Section>
          </div>

          {/* Temporary Deferrals */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10">
            <Section title="Temporary Deferrals (Wait Before Donating)">
              <p className="text-[#5A5A5A] mb-3">You should <strong>wait</strong> before donating if you have:</p>
              <XItem>Cold, flu, or fever in the last 7 days</XItem>
              <XItem>Taken antibiotics in the last 72 hours</XItem>
              <XItem>Had a tattoo or piercing in the last 6 months</XItem>
              <XItem>Recently received a live-virus vaccine (2–4 weeks deferral)</XItem>
              <XItem>Travelled to a malaria-endemic region in the last 12 months</XItem>
              <XItem>Recently had a tooth extraction (72 hours deferral)</XItem>
              <XItem>Pregnancy (defer until 6 weeks after delivery or end of breastfeeding)</XItem>
            </Section>
          </div>

          {/* Permanent Deferrals */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10">
            <Section title="Permanent Deferrals">
              <XItem>HIV/AIDS or positive test for Hepatitis B, C, or HTLV</XItem>
              <XItem>History of injecting recreational drugs</XItem>
              <XItem>Severe heart or lung disease</XItem>
              <XItem>Insulin-dependent diabetes with complications</XItem>
              <XItem>History of Creutzfeldt-Jakob Disease (CJD) or related conditions</XItem>
            </Section>
          </div>

          {/* Day of Donation */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10">
            <Section title="On Donation Day">
              <CheckItem>The actual donation takes only 8–10 minutes</CheckItem>
              <CheckItem>Total visit time including registration & rest is 45–60 minutes</CheckItem>
              <CheckItem>You will be given refreshments and a 15-minute rest period after donating</CheckItem>
              <CheckItem>Do not drive heavy machinery or operate vehicles for 1 hour after donation</CheckItem>
              <CheckItem>Keep the bandage on for at least 4 hours</CheckItem>
            </Section>
          </div>

          {/* After Donation */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10">
            <Section title="After Donation Care">
              <CheckItem>Drink extra fluids for the next 24 hours</CheckItem>
              <CheckItem>Avoid strenuous physical activity and heavy lifting for 24 hours</CheckItem>
              <CheckItem>If you feel dizzy or lightheaded, sit or lie down immediately</CheckItem>
              <CheckItem>Contact us immediately if you experience prolonged bleeding or severe discomfort</CheckItem>
            </Section>
          </div>

          {/* CTA */}
          <div className="border-t border-[rgba(26,18,16,0.07)] pt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/find-camps"
              className="flex-1 bg-[#BE1F2E] text-white text-center py-4 rounded-full text-[15px] font-[600] hover:bg-[#a31825] transition-colors"
            >
              Find a Donation Camp
            </Link>
            <Link
              to="/contact"
              className="flex-1 border border-[rgba(26,18,16,0.12)] text-[#1a1210] text-center py-4 rounded-full text-[15px] font-[600] hover:bg-[#f5f0eb] transition-colors"
            >
              Contact Medical Team
            </Link>
          </div>
        </div>
      </main>

      <DonorFooter />
    </div>
  );
};

export default DonorGuidelines;
