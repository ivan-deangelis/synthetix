import { motion } from "framer-motion";
import { User } from "lucide-react";
import { RegistrationInput } from "./RegistrationInput";
import { useState } from "react";

const RegistrationInputUsername = ({
    value,
    onChange,
    placeholder = "Username",
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <motion.div
            className="relative group/input-username"
            whileFocus={{ scale: 1.02 }}
            whileHover={{ scale: 1.01 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
            }}
        >
            <div className="absolute -inset-[0.5px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 rounded-lg opacity-0 group-hover/input-username:opacity-100 transition-all duration-300" />

            <div className="relative flex items-center overflow-hidden rounded-lg">
                <User
                    className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        isFocused ? "text-white" : "text-white/40"
                    }`}
                />

                <RegistrationInput
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                />

                {/* Input highlight effect */}
                {isFocused && (
                    <motion.div
                        layoutId="input-username-highlight"
                        className="absolute inset-0 bg-white/5 -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.2,
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default RegistrationInputUsername;
