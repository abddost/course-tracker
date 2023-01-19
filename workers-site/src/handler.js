import { isAllowed } from "./is-allowed";
import { getMethod } from "./get-method";
import { getTarget } from "./get-target";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
import { configs } from "../config";

const config = { ...configs };
const parseJson = (obj) => {
  try {
    return JSON.parse(obj);
  } catch (e) {
    return obj;
  }
};

export async function handleRequest(event) {
  const { request } = event;

  try {
    const method = getMethod(request);
    const target = getTarget(request, config);

    let options = {};

    if (
      !isAllowed(
        method,
        target.airtableResource,
        parseJson(config.allowedTargets)
      )
    ) {
      return new Response("Method Not Allowed", {
        status: 405,
        statusText: `Method "${method}" not allowed on "${
          target.airtableResource
        }" resource`,
      });
    }

    const path = new URL(request.url).pathname;
    const pathArr = path.split("/");

    if (pathArr[1] === "courses") {
      const responseAirtable = await fetch(target.airtableRequestUrl, {
        headers: {
          Authorization: `Bearer ${config.airtableApiKey}`,
          "Content-type": "application/json",
        },
        method: method,
        body: request.body,
      });

      const body = await responseAirtable.body;

      const { value: bodyIntArray } = await body.getReader().read();

      const bodyJSON = new TextDecoder().decode(bodyIntArray);

      const headers = new Headers();

      for (const kv of responseAirtable.headers.entries()) {
        headers.append(kv[0], kv[1]);
      }

      return new Response(bodyJSON, {
        status: responseAirtable.status,
        statusText: responseAirtable.statusText,
        headers: { ...headers, "content-type": "application/json" },
      });
    }

    options.cacheControl = {
      bypassCache: true,
    };
    const page = await getAssetFromKV(event, options);

    // allow headers to be altered
    const response = new Response(page.body, page);

    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "unsafe-url");
    response.headers.set("Feature-Policy", "none");

    return response;
  } catch (e) {
    console.error(e);

    return new Response(`Bad Request`, {
      status: 400,
      statusText: "Bad Request",
    });
  }
}

function handlePrefix(prefix) {
  return (request) => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request);
    let url = new URL(defaultAssetKey.url);

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, "/");

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey);
  };
}
