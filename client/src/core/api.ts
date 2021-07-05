const ApiCall = async (url: string) => fetch(url).then((res) => res.json());

export default ApiCall;
