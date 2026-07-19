# Stock Alert PoC 開発ルール

このファイルは、このリポジトリで作業する人間・AI向けの開発ルール正本です。
新しいスレッドや新しい作業セッションでは、まずこのファイルと現行コードを確認してください。

## 1. このプロジェクトの目的

このリポジトリは、株式投資そのものを検討するプロジェクトではありません。
目的は、Google Sheets等で人間・AIが設計した購入アラートを、将来自動監視・通知するためのアプリケーション基盤を作ることです。

投資判断、銘柄選定、買値・売値・数量の妥当性検討は別の株関連プロジェクトで行います。
このリポジトリでは、アラート設計内容は基本的に入力データとして扱い、実行基盤の設計・実装に集中します。

## 2. 最重要方針

技術よりアラート設計品質が重要です。

- Google Sheets = 人間・AIが設計するルールの正本
- Backend = 正本を読み込んで実行するエンジン
- DB = 将来、通知履歴・状態・株価履歴など機械的履歴のみ保存

アラート設計自体をDB正本にはしません。

## 3. PoCの基本原則

PoCでは、常に最小の成功条件だけを実装します。

- 不要な抽象化を先に入れない
- 将来必要になりそう、という理由だけで機能を追加しない
- 問題の切り分けが難しくなる変更をまとめて入れない
- 一段階ずつ動作確認してから次へ進む

PoCなのに本番運用前提の複雑な構成を先に作らないでください。

## 4. 現在の最優先マイルストーン

APKのビルド・GitHub Release公開・Android端末でのインストール・起動確認は完了済みです。

現在の最優先は、Firebase Cloud Messaging (FCM) によるPush通知受信確認です。

Android側には以下を実装済みです。

- Firebase Messaging SDK
- FCM登録トークン取得・画面表示
- `FirebaseMessagingService` によるメッセージ受信
- 通知チャンネル
- Android 13以降の通知権限要求
- FCM受信時の通知表示

次の確認手順:

1. FirebaseプロジェクトへAndroidアプリ `com.quzq.stockalertpoc` を登録する
2. `google-services.json` を取得する
3. Base64化した内容をGitHub Repository Secret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` に登録する
4. GitHub ActionsでDebug APKを再ビルドする
5. Android端末へ最新APKをインストールする
6. アプリ画面に `FCM ready` とRegistration tokenが表示されることを確認する
7. Firebase側からRegistration token宛てにテスト通知を送る
8. Android端末に通知が届けばFCM受信確認完了

Secretが未設定でもAPKはビルド可能ですが、そのAPKではFCMは動作しません。

## 5. PoC Stage 1 の最終合格ライン

FCM受信確認後、次の合格ラインを目指します。

GCP上のTypeScript Backendを実行すると、立花証券e支店APIから1銘柄の現在株価を取得し、その価格がAndroid端末へFCM Pushで届くこと。

通知内容:

- 銘柄コード
- 銘柄名
- 現在株価
- 取得時刻

Stage 1では以下を実装しません。

- Google Sheets連携
- WebSocket
- DB
- チャート
- アラート価格判定
- 重複通知防止
- 複数銘柄監視
- 本格Android UI

## 6. 実装順序

現在の想定順序:

1. Android最小アプリ 完了
2. GitHub ActionsでDebug APK生成 完了
3. Android端末でAPKインストール・起動確認 完了
4. Firebase / FCM Android実装 完了
5. Android端末でPush受信確認 現在地
6. TypeScript Backendから立花証券e支店APIで1銘柄取得
7. Backend → FCM → Android Push
8. PoC Stage 1完了
9. Google Sheets読み取り連携
10. WebSocket監視
11. アラート判定
12. 重複通知防止
13. DB
14. 一覧UI / 詳細UI / チャート

順番を飛ばして大きな機能を先に追加しないでください。

## 7. Git運用

PoC期間中は `main` ブランチのみで運用します。

- 小さな変更は `main` へ直接反映してよい
- featureブランチやPR運用は現時点では不要
- 継続開発フェーズへ移行した時点で再検討する

管理のための管理を増やさないことを優先します。

## 8. リポジトリ構成

```text
stock-alert-poc/
├─ backend/
├─ mobile/
├─ infrastructure/
├─ .github/
│  └─ workflows/
├─ AGENTS.md
└─ README.md
```

役割:

- `backend/`: TypeScript Backend
- `mobile/`: Androidアプリ
- `infrastructure/`: GCP / Terraform等
- `.github/workflows/`: GitHub Actions

## 9. 技術方針

基本方針:

- BackendはTypeScript
- コンテナ化はDocker
- Infrastructure as CodeはTerraform候補
- 設定は環境変数
- Secretはコードへ埋め込まない
- データプロバイダ依存は将来差し替え可能にする
- Androidから証券APIへ直接アクセスしない

構成:

```text
Android
  ↓
自前Backend
  ↓
株価データプロバイダ
```

証券APIキーをAndroidへ持たせないこと。

Firebase設定:

- Application IDは `com.quzq.stockalertpoc`
- `mobile/app/google-services.json` はコミットしない
- GitHub ActionsではSecret `FIREBASE_GOOGLE_SERVICES_JSON_BASE64` からビルド時に復元する
- Secret未設定時はFirebase設定なしAPKとしてビルドする

## 10. クラウド方針

初期クラウドはGCPですが、GCP専用アプリにはしません。

PoC候補:

- Cloud Run
- Firebase / FCM

将来の常時監視ではCloud Run Jobまたは常駐コンテナを検討します。

AWSならECS / Fargate、AzureならContainer Appsへ移行できる程度の疎結合を意識します。

## 11. Google Sheets正本

Google Sheetsは、アラート設計や保有状況など、人間・AIが確認・編集する情報の正本として利用します。

- リポジトリ内の文書やソースコードに、個人用Spreadsheet IDや非公開シート名を記載しない
- 接続先IDなど環境依存の値は、将来Secretまたは環境変数で管理する
- アラート設計そのものはDB正本へ移行しない

## 12. 個人情報・秘密情報

公開リポジトリには、開発に不要な個人情報や個人環境情報を記載しません。

以下は原則としてコミットしないこと:

- 個人名、メールアドレス、住所などの個人情報
- 個人が使用している端末の具体的な機種名
- 個人用Google SheetsのSpreadsheet IDや非公開シート名
- APIキー、トークン、認証情報
- `google-services.json` など環境依存の設定ファイル
- その他、公開する必要のないアカウント固有情報

必要な設定値は環境変数またはSecretで管理します。

## 13. 開発時の注意

- ユーザーの明示がない限り、勝手に機能を増やさない
- 現在のマイルストーンに不要なライブラリを入れない
- DBを「どうせ後で使うから」という理由で先に入れない
- 問題切り分けを最優先する
- 新しいスレッドでは、過去の会話記憶だけで判断せず、このファイルと現行コードを確認する
- Prettierは、ユーザーが明示した場合、またはプロジェクトのPrettier設定が存在する場合のみ実行する

## 14. 現在地

APK配布ループとAndroid側FCM受信実装は完了済みです。
現在はFirebaseプロジェクト設定をGitHub Secretへ登録し、Registration token取得とPush通知受信を実機確認する段階です。
