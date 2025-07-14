export async function asyncSome(callBack, values) {
  if (!values || values.length === 0) {
    return false;
  }

  for (const value of values) {
    if (await callBack(value)) {
      return true;
    }
  }
  return false;
}

export async function asyncEvery(callBack, values) {
  if (!values || values.length === 0) {
    return true;
  }

  const results = await Promise.all(values.map((value) => callBack(value)));

  return results.every((result) => result);
}
