import { SignUp } from "@clerk/nextjs";
import RegistrationBox from "@/components/Registration/RegistrationBox";
import HeroBg from "@/components/HeroBg";

export default async function SignUpPage() {
    return (
        <HeroBg>
            <RegistrationBox>
                <SignUp
                    appearance={{
                        layout: {
                            helpPageUrl: "",
                            socialButtonsVariant: "blockButton",
                        },
                        elements: {
                            card: "bg-transparent shadow-none border-0 p-4 !rounded-none",
                            headerTitle:
                                "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80",
                            headerSubtitle: "text-white/60 text-xs",
                            form: "space-y-3",
                            formFieldLabel: "text-white/60 text-xs",
                            formFieldInput:
                                "w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 px-3 rounded-lg focus:bg-white/10",
                            formButtonPrimary:
                                "relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center mt-2",
                            footer: "[background:transparent!important]",
                            footerAction: "!bg-transparent",
                            dividerRow: "hidden",
                            socialButtons: "hidden",
                            identityPreview: "text-white",
                            formFieldAction: "text-xs text-white/60 hover:text-white",
                            formResendCodeLink: "text-white",
                            formFieldErrorText: "text-red-400 text-xs",
                            cardBox: "!shadow-none !border-none",
                        },
                        variables: {
                            colorBackground: "transparent",
                            colorText: "white",
                            colorInputBackground: "rgba(255,255,255,0.05)",
                            colorInputText: "white",
                            colorPrimary: "white",
                            colorDanger: "#f87171",
                            borderRadius: "0.5rem",
                        },
                    }}
                    routing="hash"
                />
            </RegistrationBox>
        </HeroBg>
    );
}
