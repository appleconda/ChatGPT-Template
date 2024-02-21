export function removeFieldsWithKey(
  obj: any,
  keyToRemove: string = "__typename",
): void {
  const stack: any[] = [obj];

  while (stack.length) {
    const current = stack.pop();

    if (Array.isArray(current)) {
      for (const item of current) {
        if (typeof item === "object" && item !== null) {
          stack.push(item);
        }
      }
    } else if (typeof current === "object" && current !== null) {
      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          if (key === keyToRemove) {
            delete current[key];
          } else if (typeof current[key] === "object") {
            stack.push(current[key]);
          }
        }
      }
    }
  }
}
