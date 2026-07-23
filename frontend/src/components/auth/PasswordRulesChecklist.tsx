import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { PASSWORD_RULES } from "../../hooks/usePasswordValidation";

interface PasswordRulesChecklistProps {
  password: string;
}

export function PasswordRulesChecklist({ password }: PasswordRulesChecklistProps) {
  return (
    <motion.ul
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 space-y-1 text-xs pl-1"
    >
      {PASSWORD_RULES.map((rule) => {
        const isPassing = rule.test(password);
        return (
          <li key={rule.id} className="flex items-center gap-1.5">
            {isPassing ? (
              <CheckCircle2
                className="size-3.5 shrink-0"
                style={{ color: "#27ae60" }}
              />
            ) : (
              <XCircle className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span
              style={{ color: isPassing ? "#27ae60" : undefined }}
              className={isPassing ? "" : "text-muted-foreground"}
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </motion.ul>
  );
}
