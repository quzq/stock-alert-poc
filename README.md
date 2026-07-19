# Stock Alert PoC

株価アラートの設計ルールをもとに、株価監視・優先順位判定・Push通知を自動化するためのPoCです。

このリポジトリは投資判断そのものを行う場所ではなく、Google Sheets等で設計されたアラートを実行するアプリケーション基盤の検証を目的としています。

## Android APK

最新のPoC用Debug APKは、以下から直接ダウンロードできます。

[**最新APKをダウンロード**](https://github.com/quzq/stock-alert-poc/releases/download/poc-latest/app-debug.apk)

`main` のAndroid関連コードが更新されると、GitHub ActionsでDebug APKをビルドし、`poc-latest` Releaseの `app-debug.apk` を更新します。

> APKはPoC用のDebugビルドです。Android端末へ手動インストールする場合、端末側でブラウザ等からの「不明なアプリのインストール」を許可する必要があります。

## 現在のマイルストーン

APKのビルド・公開・Android端末でのインストール・起動確認まで完了しています。

現在は **Firebase Cloud Messaging (FCM) のPush通知受信確認** が最優先です。

Androidアプリ側には以下を実装済みです。

- Firebase Messaging SDK
- FCM登録トークン取得・画面表示
- `FirebaseMessagingService` によるメッセージ受信
- 通知チャンネル作成
- Android 13以降の通知権限要求
- FCM受信時のAndroid通知表示

Firebase設定が入っていないAPKでは、アプリ画面に `FCM configuration not set` と表示されます。

## Firebase / FCM セットアップ

AndroidアプリのApplication IDは以下です。

```text
com.quzq.stockalertpoc
```

1. Firebaseプロジェクトを作成する
2. FirebaseプロジェクトへAndroidアプリ `com.quzq.stockalertpoc` を登録する
3. `google-services.json` を取得する
4. ファイル内容をBase64化する
5. GitHub Repository Secret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` に登録する
6. GitHub Actionsの `Build Android Debug APK` を再実行する
7. READMEの「最新APKをダウンロード」からAPKを再インストールする
8. アプリ起動時に通知を許可する
9. 画面に `FCM ready` とRegistration tokenが表示されればAndroid側のFCM準備完了

`google-services.json` は公開リポジトリへコミットしません。GitHub ActionsがSecretからビルド時だけ復元します。

Secretが未設定でもAPK自体はビルドできますが、そのAPKではFCMは動作しません。

## FCM受信テスト

FCM有効APKを起動するとRegistration tokenが画面に表示されます。テキストは選択可能です。

Firebase側からそのRegistration token宛てにテスト通知を送信し、Android端末へ通知が届けばFCM受信確認完了です。

## PoC Stage 1

FCM受信確認後、次の最小成功条件を目指します。

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
- DBを先回りして導入しない
- PoC期間中は `main` ブランチのみで運用する
- Google Sheetsは将来もアラート設計の正本として維持する
- 公開リポジトリに個人情報・個人端末情報・非公開ID・認証情報を記載しない
- Firebase設定ファイルはGitHub Secret経由でビルド時に注入する

詳細な開発ルールは [`AGENTS.md`](./AGENTS.md) を参照してください。
