// utils/cookie-utils.js

export const CookieManager = {
  set: (name, value, options = {}) => {
    let expires = "";
    if (typeof options === "number") {
      // Legacy support for days as 3rd argument
      expires = `; expires=${new Date(Date.now() + options * 864e5).toUTCString()}`;
    } else if (options.expires) {
      const days = options.expires;
      expires = `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`;
    }

    const path = options.path ? `; path=${options.path}` : "; path=/";
    const secure = options.secure ? "; secure" : "";
    const sameSite = options.sameSite ? `; samesite=${options.sameSite}` : "";

    document.cookie = `${name}=${encodeURIComponent(value)}${expires}${path}${secure}${sameSite}`;
  },

  get: (name) => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
    return cookies[name];
  },

  remove: (name) => {
    document.cookie = `${name}=; expires=${new Date(0).toUTCString()}; path=/`;
  },
};
