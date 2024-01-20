export type User = {
  id: string;
  active: boolean;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type Item = {
  id: string;
  active: boolean;
  category_id: string;
  name: string;
  summary: string;
  openingParagraph: string;
  closingParagraph: string;
  embeddedImage: string | File | FileList | null;
  height: number;
  created_at: string;
  updated_at: string;
  category: string;
};
