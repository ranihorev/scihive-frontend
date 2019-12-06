interface Author {
  first_name: string;
  last_name: string;
}

export interface FileMetadata {
  id: string;
  title: string;
  abstract: string;
  authors: Author[];
  date: Date;
}
