import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translationDictionary = {
  // Navigation Links
  "Features": "विशेषताएं",
  "How it works": "यह कैसे काम करता है",
  "Who uses it": "कौन उपयोग करता है",
  "Pilot": "पायलट परियोजना",
  "Login": "लॉगिन",
  "Access Portals": "पोर्टल प्रवेश",

  // Hero Section
  "Now Scaling in Maharashtra": "अब महाराष्ट्र में विस्तार हो रहा है",
  "The smartest way to manage blood in India": "भारत में रक्त प्रबंधन का सबसे स्मार्ट तरीका",
  "AI-driven logistics layer for India's blood supply chain. Reducing wastage by up to 10% using real-time predictive demand sensing.": "भारत की रक्त आपूर्ति श्रृंखला के लिए एआई-संचालित लॉजिस्टिक्स परत। रीयल-टाइम प्रेडिक्टिव डिमांड सेंसिंग का उपयोग करके अपशिष्ट को 10% तक कम करना।",
  "Request Emergency Access": "आपातकालीन पहुंच का अनुरोध करें",
  "Watch Product Pilot": "उत्पाद पायलट देखें",

  // Stats Section
  "Avg. Wastage Reduced": "औसत अपशिष्ट में कमी",
  "Consistent across pilot hospitals": "पायलट अस्पतालों में लगातार",
  "Stock Forecasting Window": "स्टॉक पूर्वानुमान विंडो",
  "Precision demand sensing ahead": "सटीक मांग पूर्वानुमान",
  "Logistics Features Unique": "अद्वितीय लॉजिस्टिक्स विशेषताएं",
  "No other platform matches this": "कोई अन्य प्लेटफॉर्म इसकी बराबरी नहीं करता",

  // Marquee text
  "PREDICTIVE ANALYTICS": "पूर्वानुमानित विश्लेषण",
  "COLD CHAIN MONITORING": "कोल्ड चेन मॉनिटरिंग",
  "DONOR RETENTION": "रक्तदाता प्रतिधारण",
  "REAL-TIME INVENTORY": "रीयल-टाइम इन्वेंटरी",
  "INTER-HOSPITAL TRANSFER": "अस्पतालों के बीच स्थानांतरण",

  // Large Feature Card
  "Central Intelligence": "केंद्रीय खुफिया",
  "Unified Supply Dashboard": "एकीकृत आपूर्ति डैशबोर्ड",
  "Every unit tracked, from collection to transfusion. Zero blind spots in the national grid.": "प्रत्येक इकाई को संग्रह से लेकर ट्रांसफ्यूजन तक ट्रैक किया जाता है। राष्ट्रीय ग्रिड में शून्य ब्लाइंड स्पॉट।",
  "Real-time Stock (Pune Cluster)": "रीयल-टाइम स्टॉक (पुणे क्लस्टर)",
  "LIVE": "लाइव",

  // Feature Cards
  "AI Forecasting": "एआई पूर्वानुमान",
  "Predict demand surges based on historical events, weather, and hospital data.": "ऐतिहासिक घटनाओं, मौसम और अस्पताल के डेटा के आधार पर मांग में वृद्धि की भविष्यवाणी करें।",
  "Optimized Routing": "अनुकूलित रूटिंग",
  "Dynamic transit paths for life-saving units between banks and surgical units.": "ब्लड बैंकों और सर्जिकल इकाइयों के बीच जीवन रक्षक इकाइयों के लिए गतिशील पारगमन मार्ग।",
  "Chain of Custody": "सुरक्षित हिरासत श्रृंखला",
  "QR-based verification at every touchpoint ensures unit integrity and safety.": "प्रत्येक टचपॉइंट पर क्यूआर-आधारित सत्यापन इकाई की अखंडता और सुरक्षा सुनिश्चित करता है।",
  "Smart Alerts": "स्मार्ट अलर्ट",
  "Automated SMS and App triggers for rare blood type donors in specific zones.": "विशिष्ट क्षेत्रों में दुर्लभ रक्त प्रकार के दाताओं के लिए स्वचालित एसएमएस और ऐप ट्रिगर्स।",

  // Lifecycle
  "The Lifecycle of a Life": "जीवन का जीवन चक्र",
  "Sourcing": "रक्त का स्रोत",
  "Strategic donor mapping and mobile camp optimization across districts.": "जिलों भर में रणनीतिक रक्तदाता मैपिंग और मोबाइल कैंप अनुकूलन।",
  "Validation": "सत्यापन",
  "Digital documentation of testing and cross-matching results.": "परीक्षण और क्रॉस-मैचिंग परिणामों का डिजिटल दस्तावेज़ीकरण।",
  "Optimized Storage": "अनुकूलित भंडारण",
  "AI-suggested stocking based on localized demand heatmaps.": "स्थानीयकृत मांग हीटमैप के आधार पर एआई-सुझाया गया स्टॉक।",
  "Transfusion": "रक्ताधान (ट्रांसफ्यूजन)",
  "Real-time matching and priority delivery to operating rooms.": "ऑपरेटिंग रूम में रीयल-टाइम मिलान और प्राथमिकता वितरण।",

  // Ecosystem Section
  "Built for the entire ecosystem": "पूरे पारिस्थितिकी तंत्र के लिए निर्मित",
  "A modular platform that scales across organizational roles and requirements.": "एक मॉड्यूलर प्लेटफॉर्म जो संगठनात्मक भूमिकाओं और आवश्यकताओं के अनुसार स्केल करता है।",
  "Hospital Staff": "अस्पताल कर्मचारी",
  "Request units in seconds and track transit in real-time with live updates.": "सेकंड में इकाइयों का अनुरोध करें और लाइव अपडेट के साथ रीयल-टाइम में पारगमन को ट्रैक करें।",
  "Health Officer": "स्वास्थ्य अधिकारी",
  "District-wide oversight and crisis management tools with drill-down reports.": "ड्रिल-डाउन रिपोर्ट के साथ जिला-व्यापी निगरानी और संकट प्रबंधन उपकरण।",
  "Bank Admin": "ब्लड बैंक प्रशासक",
  "Digital inventory logs and automated compliance reporting dashboards.": "डिजिटल इन्वेंटरी लॉग और स्वचालित अनुपालन रिपोर्टिंग डैशबोर्ड।",
  "Life Donor": "रक्तदाता",
  "Digital donor card, health history, and reward points for loyal donors.": "वफादार दाताओं के लिए डिजिटल डोनर कार्ड, स्वास्थ्य इतिहास और इनाम अंक।",
  "Learn more": "अधिक जानें",

  // Pilot Section
  "Ready to modernize your blood logistics?": "क्या आप अपने रक्त लॉजिस्टिक्स को आधुनिक बनाने के लिए तैयार हैं?",
  "Onboard your hospital in under 48 hours.": "48 घंटे से कम समय में अपने अस्पताल को शामिल करें।",
  "Zero upfront capital expenditure for government banks.": "सरकारी बैंकों के लिए शून्य अग्रिम पूंजीगत व्यय।",
  "24/7 technical support and on-site training.": "24/7 तकनीकी सहायता और ऑन-साइट प्रशिक्षण।",
  "Active Pilots": "सक्रिय पायलट",
  "Units Tracked": "ट्रैक की गई इकाइयाँ",
  "Maharashtra Pilot": "महाराष्ट्र पायलट",
  "NABH Compliant": "एनएबीएच अनुपालन",
  "AI-Enabled": "एआई-सक्षम",

  // Request Demo Form
  "Request Demo Access": "डेमो एक्सेस का अनुरोध करें",
  "See how RaktSetu can optimize your district's blood supply through real-time predictive data.": "देखें कि कैसे रक्तसेतु रीयल-टाइम भविष्य कहने वाले डेटा के माध्यम से आपके जिले की रक्त आपूर्ति को अनुकूलित कर सकता है।",
  "Your work email": "आपका कार्य ईमेल",
  "Start Pilot Discussion": "पायलट चर्चा शुरू करें",
  "Request received!": "अनुरोध प्राप्त हुआ!",
  "We'll be in touch within 24 hours.": "हम 24 घंटे के भीतर आपसे संपर्क करेंगे।",

  // Footer Links & Info
  "Precision blood logistics for India's 1.4 billion people. Building the digital infrastructure for a healthier tomorrow.": "भारत की 1.4 अरब आबादी के लिए सटीक रक्त लॉजिस्टिक्स। स्वस्थ कल के लिए डिजिटल बुनियादी ढांचे का निर्माण।",
  "Made with pride in India": "भारत में गर्व के साथ निर्मित",
  "Platform": "प्लेटफॉर्म",
  "Company": "कंपनी",
  "Twitter": "ट्विटर",
  "LinkedIn": "लिंक्डइन",
  "GitHub": "गिटहब",

  // Portal Modals & Role Select
  "Access RaktSetu Portals": "रक्तसेतु पोर्टल्स में प्रवेश करें",
  "Select your portal role to register or log in to the system console.": "सिस्टम कंसोल में पंजीकरण या लॉगिन करने के लिए अपनी भूमिका चुनें।",
  "Individual Donor": "व्यक्तिगत रक्तदाता",
  "Donate blood, check eligibility, and track your saving impact.": "रक्तदान करें, पात्रता की जांच करें, और अपने जीवन रक्षक प्रभाव को ट्रैक करें।",
  "Register": "पंजीकरण करें",
  "Hospital Admin": "अस्पताल प्रशासक",
  "Register your clinical facility and manage portal operations.": "अपनी चिकित्सा सुविधा का पंजीकरण करें और पोर्टल संचालन का प्रबंधन करें।",
  "Register Hospital": "अस्पताल का पंजीकरण करें",
  "Update stock volumes, manage alerts, and handle transfers.": "स्टॉक की मात्रा अपडेट करें, अलर्ट प्रबंधित करें और स्थानान्तरण संभालें।",
  "Staff Login": "स्टाफ लॉगिन",
  "Invite Only": "केवल आमंत्रण",
  "Invited by Admin": "प्रशासक द्वारा आमंत्रित",
  "District Officer": "जिला अधिकारी",
  "Organize regional donation camps and inspect shortage analytics.": "क्षेत्रीय रक्तदान शिविर आयोजित करें और कमी के विश्लेषण का निरीक्षण करें।",
  "Officer Login": "अधिकारी लॉगिन",
  "Gov. Authorized": "सरकार द्वारा अधिकृत",
  "Authorized Access": "अधिकृत पहुंच",
  "State Admin": "राज्य प्रशासक",
  "State-level oversight — cross-district analytics, waste KPIs, and funding approvals.": "राज्य-स्तरीय निगरानी - क्रॉस-डिस्ट्रिक्ट एनालिटिक्स, वेस्ट केपीआई, और फंडिंग अनुमोदन।",
  "State Login": "राज्य लॉगिन",
  "Gov. Nominated": "सरकार द्वारा नामित",
  "By Nomination": "नामांकन द्वारा",
  "System Admin": "सिस्टम प्रशासक",
  "Manage system configurations, users, and hospital approvals.": "सिस्टम कॉन्फ़िगरेशन, उपयोगकर्ताओं और अस्पताल अनुमोदनों का प्रबंधन करें।",
  "Console Login": "कंसोल लॉगिन",
  "Restricted Access": "प्रतिबंधित पहुंच",
  "Admin Controlled": "प्रशासक नियंत्रित",

  // Donor Registration Page
  "Create your donor account": "अपना रक्तदाता खाता बनाएं",
  "Join thousands of donors saving lives across Maharashtra.": "महाराष्ट्र में जीवन बचाने वाले हजारों रक्तदाताओं में शामिल हों।",
  "Continue with Google": "गूगल के साथ जारी रखें",
  "or register with mobile number": "या मोबाइल नंबर के साथ पंजीकरण करें",
  "Mobile Number": "मोबाइल नंबर",
  "Enter 10-digit number": "10 अंकों का नंबर दर्ज करें",
  "Send OTP": "ओटीपी भेजें",
  "Sending…": "भेजा जा रहा है...",
  "OTP Sent!": "ओटीपी भेजा गया!",
  "Verify your mobile": "अपना मोबाइल सत्यापित करें",
  "We've sent a 6-digit code to": "हमने 6-अंकों का कोड भेजा है",
  "Please enter all 6 digits.": "कृपया सभी 6 अंक दर्ज करें।",
  "Verified! Redirecting…": "सत्यापित! पुनर्निर्देशित किया जा रहा है...",
  "Resend OTP in": "ओटीपी पुनः भेजें",
  "Resend OTP": "ओटीपी पुनः भेजें",
  "Verify & Continue": "सत्यापित करें और जारी रखें",
  "Back": "पीछे",
  "Back to change mobile number": "मोबाइल नंबर बदलने के लिए पीछे जाएं",
  "Need help?": "मदद की ज़रूरत है?",
  "Donor Registration": "रक्तदाता पंजीकरण",
  "Verifying…": "सत्यापित किया जा रहा है…"
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('raktsetu_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('raktsetu_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (text) => {
    if (language === 'hi' && translationDictionary[text]) {
      return translationDictionary[text];
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
