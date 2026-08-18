type MetadataTokenResponse = {
  access_token: string;
};

type SheetsValueRangeResponse = {
  values?: unknown[][];
};

const metadataTokenUrl =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

async function getCloudRunAccessToken(): Promise<string> {
  const response = await fetch(metadataTokenUrl, {
    headers: {
      'Metadata-Flavor': 'Google',
    },
  });

  if (!response.ok) {
    throw new Error(`Metadata server returned HTTP ${response.status}.`);
  }

  const tokenResponse = (await response.json()) as MetadataTokenResponse;

  if (!tokenResponse.access_token) {
    throw new Error('Metadata server did not return an access token.');
  }

  return tokenResponse.access_token;
}

export async function getSheetValues(a1Range: string): Promise<unknown[][]> {
  const spreadsheetId = requireEnv('GOOGLE_SPREADSHEET_ID');
  const accessToken = await getCloudRunAccessToken();
  const endpoint =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${encodeURIComponent(a1Range)}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Sheets API returned HTTP ${response.status}.`);
  }

  const valueRange = (await response.json()) as SheetsValueRangeResponse;
  return valueRange.values ?? [];
}
