import { Shield, Lock, CheckCircle2 } from "lucide-react";

interface SecurityTabProps {
  security: any;
}

export function SecurityTab({ security }: SecurityTabProps) {
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2 pb-4">
      
      <div className="bg-bg-surface border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Authentication</h3>
        </div>
        <p className="text-xs text-text-muted">{security.authMethod}</p>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Encryption</h3>
        </div>
        <p className="text-xs text-text-muted">{security.encryption}</p>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Compliance Standards</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {security.compliance.map((item: string, i: number) => (
            <span key={i} className="px-2 py-1 bg-bg-surface-elevated text-text-primary text-[10px] rounded-md font-mono">
              {item}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
