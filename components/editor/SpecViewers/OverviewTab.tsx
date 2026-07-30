import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface OverviewTabProps {
  overview: string;
}

export function OverviewTab({ overview }: OverviewTabProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-text-primary h-full overflow-y-auto pr-2 pb-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {overview}
      </ReactMarkdown>
    </div>
  );
}
