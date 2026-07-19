# Stock Alert PoC

株価アラートの設計ルールをもとに、株価監視・優先順位判定・Push通知を自動化するためのPoCです。

このリポジトリは投資判断そのものを行う場所ではなく、Google Sheets等で設計されたアラートを実行するアプリケーション基盤の検証を目的としています。

## Android APK

最新のPoC用Debug APKは、以下から直接ダウンロードできます。

[**最新APKをダウンロード**](https://github.com/quzq/stock-alert-poc/releases/download/poc-latest/app-debug.apk)

`main` のAndroid関連コードが更新されると、GitHub ActionsでDebug APKをビルドし、`poc-latest` Releaseの `app-debug.apk` を更新します。

> APKはPoC用のDebugビルドです。Android端末へ手動インストールする場合、端末側でブラウザ等からの「不明なアプリのインストール」を許可する必要があります。

## 現在のマイルストーン

まず、PCを使わずAndroid端末だけで以下を確認できる開発ループを完成させます。

1. `main` にAndroidコードを反映
2. GitHub ActionsでDebug APKを生成
3. GitHub ReleaseへAPKを公開
4. Android端末からこのREADMEを開く
5. APKをダウンロードしてインストール
6. アプリを起動して最小画面を確認

この段階ではFirebase / FCM / Backend / 立花証券APIは使用しません。

## PoC Stage 1

Android APK確認ループの次は、以下を最小成功条件とします。

```text
GCP上のTypeScript Backend
        ↓
立花証券e支店APIから1銘柄の現在株価を取得
        ↓
FCM
        ↓
Android端末へPush通知
```

通知内容は、銘柄コード・銘柄名・現在株価・取得時刻を想定しています。

Stage 1では、Google Sheets連携、WebSocket、DB、チャート、複数銘柄監視、本格Android UIなどは実装しません。

## Repository Structure

```text
stock-alert-poc/
├─ backend/          # TypeScript Backend
├─ mobile/           # Android app
├─ infrastructure/   # GCP / Terraform etc.
├─ .github/
│  └─ workflows/     # GitHub Actions
├─ AGENTS.md         # Development rules for humans and AI
└─ README.md
```

## Development Policy

PoCでは、問題を切り分けやすくするため一段階ずつ実装します。

- 最小の成功条件だけを先に通す
- 将来必要になりそうという理由だけで機能を追加しない
- FirebaseやDBを先回りして導入しない
- PoC期間中は `main` ブランチのみで運用する
- Google Sheetsは将来もアラート設計の正本として維持する
- 公開リポジトリに個人情報・個人端末情報・非公開ID・認証情報を記載しない

詳細な開発ルールは [`AGENTS.md`](./AGENTS.md) を参照してください。
