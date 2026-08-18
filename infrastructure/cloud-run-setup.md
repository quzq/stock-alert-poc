# Cloud Run 初回セットアップ

Backendは `main` へのpushで GitHub Actions から Cloud Run へデプロイする。
長寿命のサービスアカウントJSON鍵は使用せず、GitHub Actions と Google Cloud の認証には Workload Identity Federation を使う。

## 1. Google Cloud API

対象プロジェクトで少なくとも以下を有効化する。

- Cloud Run API (`run.googleapis.com`)
- Cloud Build API (`cloudbuild.googleapis.com`)
- Artifact Registry API (`artifactregistry.googleapis.com`)
- Google Sheets API (`sheets.googleapis.com`)

## 2. Service Account

用途を分けて2つ作る。

### GitHub Actions deploy用

GitHub Actions が Cloud Run を作成・更新するためのService Account。

必要な権限の基準:

- Cloud Run Admin (`roles/run.admin`)
- Service Usage Consumer (`roles/serviceusage.serviceUsageConsumer`)
- Cloud Run実行用Service Accountに対する Service Account User (`roles/iam.serviceAccountUser`)

Source deployではCloud Buildが実行される。Google Cloud側のBuild用Service Accountには Cloud Run Builder (`roles/run.builder`) が必要になる場合がある。

### Cloud Run runtime用

実際のBackendプロセスがGoogle APIへアクセスするためのService Account。

- サービスアカウント鍵は作成しない
- Cloud Runへ実行IDとして割り当てる
- Google Sheets側でこのService Accountを対象Spreadsheetの閲覧者として共有する

Sheets閲覧はSpreadsheetの共有設定で許可し、実際の売買設計やSpreadsheet IDを公開リポジトリへ書かない。

## 3. Workload Identity Federation

GitHub Actions用のWorkload Identity Pool / Providerを作成し、このリポジトリだけを信頼対象にする。

対象リポジトリ:

```text
quzq/stock-alert-poc
```

Providerからdeploy用Service Accountを利用できるように `roles/iam.workloadIdentityUser` を設定する。

GitHub Actions側ではJSON鍵を使わず、OIDCトークンを `google-github-actions/auth` へ渡す。

## 4. GitHub Repository Variables

Repository SettingsのActions variablesへ以下を登録する。

必須:

```text
GCP_PROJECT_ID
GCP_WIF_PROVIDER
GCP_DEPLOY_SERVICE_ACCOUNT
GCP_RUNTIME_SERVICE_ACCOUNT
GOOGLE_SPREADSHEET_ID
GOOGLE_SHEET_NAME
```

任意。未設定時はworkflow内のデフォルトを使う。

```text
GCP_REGION=asia-northeast1
CLOUD_RUN_SERVICE=stock-alert-poc-backend
```

`GCP_WIF_PROVIDER` はPool名ではなくProviderまで含む完全名を設定する。

```text
projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER
```

## 5. 初回デプロイ

上記Repository Variables設定後、`Deploy Backend to Cloud Run` workflowを `workflow_dispatch` で実行するか、Backendへcommitをpushする。

workflowは以下を行う。

```text
checkout
  ↓
TypeScript build
  ↓
Workload Identity FederationでGoogle Cloud認証
  ↓
backend/ をsource deploy
  ↓
Cloud Run runtime Service Accountを割当
```

Cloud Runは新規作成時にはprivateになる。GitHub Pagesやブラウザから直接呼ぶ段階では、Cloud Run側で一度だけpublic accessを許可する。

## 6. 疎通確認

Cloud Run URL確定後、最初に以下を確認する。

```text
GET /health
```

期待値:

```json
{"status":"ok"}
```

次にSheets接続を確認する。

```text
GET /api/sheets/probe
```

成功時はSheetの内容そのものを返さず、A1:C3を読めた件数だけ返す。

```json
{
  "status": "ok",
  "rows": 3,
  "columns": 3,
  "nonEmptyCells": 9
}
```

実際の行数・列数・セル数はSheet内容により変わる。

この疎通が成功した後で、現在モックの `getAlertSpreadsheet()` をGoogle Sheets実読込へ切り替える。
