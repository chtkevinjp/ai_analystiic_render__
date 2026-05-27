export interface HealthResponse {
  status: string;
  apiKeyConfigured: boolean;
  time: string;
}

export type TemplateType = 'standard' | 'todo' | 'agile' | 'brainstorm' | 'technical';

export interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
}

export interface LanguageOption {
  id: string;
  name: string;
}

export interface GeneratedRecord {
  id: string;
  title: string;
  transcript: string;
  result: string;
  template: TemplateType;
  language: string;
  createdAt: string;
}

export interface ExampleTranscript {
  id: string;
  title: string;
  category: string;
  content: string;
}
