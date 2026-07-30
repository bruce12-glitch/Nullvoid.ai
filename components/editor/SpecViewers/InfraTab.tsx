import { Cloud, Globe, CreditCard } from "lucide-react";

interface InfraTabProps {
  infra: any;
}

export function InfraTab({ infra }: InfraTabProps) {
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-2 pb-4">
      
      <div className="bg-bg-surface border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cloud className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Cloud Provider</h3>
        </div>
        <p className="text-xs text-text-muted">{infra.cloudProvider}</p>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Region Target</h3>
        </div>
        <p className="text-xs text-text-muted">{infra.region}</p>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-text-primary">Estimated Cost</h3>
        </div>
        <p className="text-xl font-bold text-text-primary">{infra.estimateCost}</p>
        <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Estimated Monthly Baseline</p>
      </div>

    </div>
  );
}
