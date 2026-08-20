export const addDomainToVercel = async (domain: string) => {
  if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_API_TOKEN) {
    console.warn("Vercel API Token or Project ID is missing")
    return { error: { message: "Vercel API credentials missing" } }
  }
  const response = await fetch(
    `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    }
  );
  return response.json();
};

export const removeDomainFromVercel = async (domain: string) => {
  if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_API_TOKEN) return { error: null }
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
    }`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
    }
  );
  return response.json();
};

export const checkDomainStatus = async (domain: string) => {
  if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_API_TOKEN) {
    return { configuredBy: null, misconfigured: false, verified: true } // mock for local dev
  }
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/config${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const verifyDomain = async (domain: string) => {
  if (!process.env.VERCEL_PROJECT_ID || !process.env.VERCEL_API_TOKEN) {
    return { verified: true } // mock for local dev
  }
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify${
      process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
    }`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};
