import React, { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: "$19",
    description:
      "Perfect for individual educators and small teams looking to automate grading.",
    features: [
      "1 User Account",
      "100 Paper Evaluations / month",
      "Basic Grading Criteria",
      "Text Recognition",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    description:
      "Advanced tools for educational institutions aiming for streamlined operations.",
    features: [
      "Everything in Basic Plan",
      "1000 Paper Evaluations / month",
      "Custom Grading Criteria",
      "AI-Powered Feedback",
      "Multi-User Access",
      "Priority Support",
    ],
    isHighlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    description:
      "Comprehensive features for universities and large institutions.",
    features: [
      "Everything in Pro Plan",
      "5000 Paper Evaluations / month",
      "Advanced Data Analytics",
      "Integration with LMS",
      "Collaboration Tools",
      "Dedicated Account Manager",
    ],
  },
  {
    name: "Enterprise",
    price: "$199",
    description:
      "Tailored solutions with top-tier support and customization options.",
    features: [
      "Everything in Business Plan",
      "Unlimited Evaluations",
      "Custom AI Model Training",
      "API Access",
      "On-Premise Deployment",
      "24/7 Dedicated Support",
    ],
  },
];

const ChooseYourPlan = () => {
  const [isMonthly, setIsMonthly] = useState(true);

  const toggleDuration = () => {
    setIsMonthly(!isMonthly);
  };

  return (
    <div className="bg-gray-100 py-20 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16">
      {/* Title */}
      <h2 className="lg:text-6xl text-3xl font-urbanist text-center text-gray-700 px-6">
        Flexible Pricing for Every Institution
      </h2>
      <p className="text-center text-gray-600 mt-4">
        Choose the right plan that fits your grading needs
      </p>

      {/* Toggle Button */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700">Monthly</span>
          <button
            onClick={toggleDuration}
            className="relative flex items-center w-16 h-8 bg-white border border-green-200 rounded-full cursor-pointer"
          >
            <div
              className={`absolute w-6 h-6 bg-green-400 rounded-full shadow-md transform transition-transform duration-300 ${
                isMonthly ? "translate-x-1" : "translate-x-8"
              }`}
            ></div>
          </button>
          <span className="text-gray-500">
            Yearly{" "}
            <span className="text-green-400 py-1 bg-red-50 text-sm border border-green-200 px-1 rounded-full">
              20% off
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-6 mt-10">
        {plans.map((plan, index) => (
          <div
          key={index}
          className={`rounded-xl p-6 lg:max-w-96 w-full border transition-transform duration-300 transform ${
            plan.isHighlighted
              ? "bg-gradient-to-r from-green-300 to-green-300 border-green-500 scale-105"
              : "bg-white border-gray-300"
          }`}
        >
        
            <h3
              className={`text-xl font-semibold ${
                plan.isHighlighted ? "text-white" : "text-gray-800"
              }`}
            >
              {plan.name}
            </h3>

            <div className="mt-4">
              <span
                className="font-bold text-6xl"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  color: plan.isHighlighted ? "#fff" : "#404040",
                  letterSpacing: "-2.88px",
                  fontWeight: 500,
                }}
              >
                {plan.price}
              </span>
              <span
                className={`text-lg ${
                  plan.isHighlighted ? "text-white" : "text-gray-500"
                }`}
              >
                {" / "}
                {isMonthly ? "Per Month" : "Per Year"}
              </span>
            </div>
            <p
              className={`mt-4 ${
                plan.isHighlighted ? "text-white" : "text-gray-700"
              }`}
              style={{ lineHeight: "1.6", fontSize: "1rem" }}
            >
              {plan.description}
            </p>
            <button
              className={`w-full py-2 px-12 mt-6 rounded-lg transition ${
                plan.isHighlighted
                  ? "bg-white text-green-400 border border-green-200 hover:bg-indigo-50"
                  : "bg-green-300 text-white hover:bg-green-400"
              }`}
            >
              Get Started
            </button>

            <div
              className={`mt-6 border-t-2 border-dashed ${
                plan.isHighlighted ? "border-white" : "border-gray-300"
              }`}
            ></div>

            <ul className="space-y-3 mt-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <span
                    className="w-6 h-6 bg-white text-green-500 flex items-center justify-center rounded-full border mr-3"
                  >
                    ✓
                  </span>
                  <p
                    className={`${
                      plan.isHighlighted ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {feature}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Free Trial Button */}
      <div className="flex justify-center py-6 mt-8">
        <a
          href="/sign-in"
          className="bg-green-500 text-white px-6 py-2 md:px-8 md:py-3 rounded-full hover:bg-green-600 shadow-md font-medium"
        >
          Start Your Free Trial
        </a>
      </div>
    </div>
  );
};

export default ChooseYourPlan;
