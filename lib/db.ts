type ContentStore = Record<string, unknown>;

type InternalStore = {
  content: ContentStore | null;
};

function getStore(): InternalStore {
  const globalRef = globalThis as typeof globalThis & { __landingStore?: InternalStore };
  if (!globalRef.__landingStore) {
    globalRef.__landingStore = {
      content: null,
    };
  }
  return globalRef.__landingStore;
}

export async function getContent(): Promise<ContentStore | null> {
  return getStore().content;
}

export async function setContent(content: ContentStore): Promise<void> {
  getStore().content = content;
}
