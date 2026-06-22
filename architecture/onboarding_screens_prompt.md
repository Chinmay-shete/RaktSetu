# UI Generation Prompt: RaktSetu Donor Onboarding

Please create a modern, responsive, multi-step onboarding wizard UI for a blood donation platform called "RaktSetu". The design should use glassmorphism, clean typography (e.g., Outfit or Inter font), deep space background, and a highly premium aesthetic.

There are 5 sequential screens in total after the user clicks "Register" on the landing page. Please implement these screens capturing the following exact data fields, and include a step progress bar (Step 1 to 5):

## Screen 1: Phone Number Input
- **Mobile number**: 10-digit input with a +91 prefix. (Required)

## Screen 2: OTP Verification
- **OTP code**: 6-digit input with a "Resend in 5:00" countdown timer. (Required)

## Screen 3: Basic Profile & Location (Demographics & Geography)
- **Full name**: Text input (2-60 characters). (Required)
- **Age**: Number input, 18-65 only. (Required)
- **Gender**: Radio buttons or segmented control (Male / Female / Other). (Required)
- **Blood group**: Prominent dropdown with options (O+, O-, A+, A-, B+, B-, AB+, AB-). (Required)
- **City**: Text input with autocomplete. (Required)
- **Pincode**: 6-digit number input. (Required)
- **Live Location**: Button/Link to "Use current GPS location". (Optional)

## Screen 4: Health & Eligibility Screening (Medical History)
- **Have you donated before?**: Yes / No toggle. (Required)
- **Date of last donation**: Date picker. (Shown only if previous answer is "Yes") (Optional)
- **Type of last donation**: Dropdown (Whole blood / Platelets / Plasma). (Shown only if donated before is "Yes") (Optional)
- **Weight above 45 kg?**: Yes / No toggle. (Required)
- **Any chronic illness?**: Yes / No toggle. (If Yes, show an optional text field to specify which one). (Required)
- **Taken any medication in last 7 days?**: Yes / No toggle. (Optional)
- **Pregnant or breastfeeding?**: Yes / No toggle. (Shown only if Gender selected is Female). (Optional)

## Screen 5: Notification Preferences (Settings & Completion)
- **Notify when blood group needed urgently**: Toggle switch (Default ON). (Required)
- **Notify about donation camps nearby**: Toggle switch (Default ON). (Optional)
- **Notification channel**: Radio selection (WhatsApp / SMS / Both). (Required)
- **Available to donate right now**: Toggle switch (Default ON). (Optional)
- **Submit Button**: A prominent "Complete Registration & Go to Dashboard" button.

### Design Requirements:
- Clearly mark Required vs Optional fields (e.g., distinct tags or asterisks).
- Provide a smooth transition animation between the wizard steps.
- Provide a brief description/helper text under complex fields (like why age or weight is asked).
