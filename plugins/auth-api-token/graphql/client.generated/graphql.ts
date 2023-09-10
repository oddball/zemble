/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-nocheck
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type GenerateApiKeyResponse = {
  __typename?: 'GenerateAPIKeyResponse';
  apiKey: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  generateAPIKey: GenerateApiKeyResponse;
};


export type MutationGenerateApiKeyArgs = {
  apiKeySecret: Scalars['String']['input'];
  expiresInSeconds?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  validateAPIKey: Scalars['Boolean']['output'];
};


export type QueryValidateApiKeyArgs = {
  apiKey: Scalars['String']['input'];
};
