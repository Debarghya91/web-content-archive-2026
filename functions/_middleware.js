// Domain redirect: paymentstraininghub.in (www and apex) -> www.paymentstraininghub.com.
// Cloudflare Pages _redirects does NOT support domain-level sources, so this
// middleware carries the redirect. It only touches .in hosts; every other
// request passes through to the site untouched.
export async function onRequest(context) {
  var url = new URL(context.request.url);
  var host = url.hostname.toLowerCase();
  if (host === "www.paymentstraininghub.in" || host === "paymentstraininghub.in") {
    url.hostname = "www.paymentstraininghub.com";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
