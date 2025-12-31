export function load({ url, params }) {

  return {
    token: url.searchParams.get('token'), // params.token,
    callbackURL: url.searchParams.get('callbackURL') ?? '/'
  };
}