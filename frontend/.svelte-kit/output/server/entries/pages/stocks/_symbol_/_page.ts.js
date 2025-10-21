const load = async ({ fetch, params }) => {
  const res = await fetch(`http://localhost:8080/stocks/${params.symbol}`);
  if (!res.ok) {
    return {
      status: res.status,
      error: new Error("Unable to load symbol data")
    };
  }
  const json = await res.json();
  return {
    symbol: json.symbol,
    history: json.history ?? []
  };
};
export {
  load
};
