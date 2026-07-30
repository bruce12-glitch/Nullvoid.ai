export interface SystemSpec {
  id: string;
  projectId: string;
  title: string;
  version: string;
  overview: string;
  services: Array<{
    name: string;
    type: string;
    description: string;
    techStack: string[];
  }>;
  security: {
    authMethod: string;
    encryption: string;
    compliance: string[];
  };
  infrastructure: {
    cloudProvider: string;
    region: string;
    estimateCost: string;
  };
}
