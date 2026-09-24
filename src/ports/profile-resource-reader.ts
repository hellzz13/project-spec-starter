export interface ProfileResourceReader {
  readText(path: string): Promise<string>;
}
