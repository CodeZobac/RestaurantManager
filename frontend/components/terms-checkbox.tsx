"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
}

export function TermsCheckbox({ 
  checked, 
  onCheckedChange, 
  required = true, 
  error 
}: TermsCheckboxProps) {
  const t = useTranslations("TermsOfService");

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Checkbox 
          id="terms-checkbox"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className={error ? "border-red-500" : ""}
        />
        <div className="space-y-1">
          <Label 
            htmlFor="terms-checkbox" 
            className={`text-sm leading-5 cursor-pointer ${error ? "text-red-600" : "text-gray-700"}`}
          >
            {t("agreement.checkbox")}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div>
            <Link 
              href="/terms"
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {t("agreement.viewTerms")}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
