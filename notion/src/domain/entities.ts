export interface NotionEntity {
  id: string;
  createdTime: string;
  lastEditedTime?: string;
}

export interface PageEntity extends NotionEntity {
  title: string;
  status?: string;
  createdAt?: string;
  icon?: string;
  cover?: string;
  parentId: string;
  content?: BlockEntity[];
}

export interface DatabaseEntity extends NotionEntity {
  title: string;
  parentPageId: string;
  properties: Record<string, PropertyDefinition>;
}

export interface BlockEntity {
  id: string;
  type: string;
  content: string;
  children?: BlockEntity[];
}

export interface PropertyDefinition {
  type: string;
  name: string;
  options?: SelectOption[];
}

export interface SelectOption {
  name: string;
  color: string;
}

export interface CommentEntity extends NotionEntity {
  pageId: string;
  content: string;
  authorId: string;
  discussionId?: string;
}

export interface UserEntity {
  id: string;
  name: string;
  email?: string;
  type: "person" | "bot";
}