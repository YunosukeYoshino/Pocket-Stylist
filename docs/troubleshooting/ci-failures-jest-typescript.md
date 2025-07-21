# CI Failures: Jest TypeScript Compilation Errors

## 問題概要

**発生日時**: 2025-07-21  
**影響範囲**: PR #37 - Gemini API migration  
**症状**: GitHub Actions CI の quality-check ジョブが失敗  
**根本原因**: Jest mock の TypeScript 型推論エラー

## 症状詳細

### 初期症状
```
FAIL Backend API backend/src/tests/GeminiService.test.ts
● Test suite failed to run

TS2345: Argument of type 'null' is not assignable to parameter of type 'never'.
TS2345: Argument of type 'true' is not assignable to parameter of type 'never'.
```

### エラーが発生していたコード
```typescript
// ❌ 問題のあったコード
jest.doMock('../services/RedisService', () => ({
  RedisService: {
    getInstance: jest.fn().mockImplementation(() => ({
      getJson: jest.fn().mockResolvedValue(null),     // ← never型として推論
      setJson: jest.fn().mockResolvedValue(true)      // ← never型として推論
    }))
  }
}))
```

## 診断プロセス

### 1. 初期仮説と検証
**仮説**: Linting エラーが原因  
**検証**: ローカルで `npm run lint` → エラーなし  
**結果**: 仮説を却下

### 2. CI ログの詳細分析
```bash
gh run view [RUN_ID] --log | grep -A10 -B10 "error\|Error\|FAILED"
```

**発見**: テストフェーズで TypeScript コンパイルエラーが発生

### 3. ローカル環境との差異調査
- **ローカル**: `npm run build` → 成功
- **CI**: `bunx jest` → TypeScript コンパイルエラー
- **原因**: Jest の TypeScript 設定でより厳密な型チェックが有効

### 4. TypeScript 型推論の問題特定
Jest の `mockResolvedValue()` が generics なしで使用された場合、TypeScript が戻り値型を `never` として推論することが判明。

## 解決方法

### 最終的な修正コード
```typescript
// ✅ 修正後のコード
jest.doMock('../services/RedisService', () => ({
  RedisService: {
    getInstance: jest.fn(() => ({
      getJson: jest.fn(() => Promise.resolve(null)),
      setJson: jest.fn(() => Promise.resolve(true))
    }))
  }
}))
```

### 修正のポイント
1. `mockResolvedValue()` → `Promise.resolve()` に変更
2. `mockImplementation()` → 直接関数定義に変更
3. 型推論の曖昧さを排除

## 試行錯誤した他の解決案

### 案1: 型アサーション（失敗）
```typescript
getJson: jest.fn().mockResolvedValue(null as any),
```
**結果**: CI で依然として `never` 型エラー

### 案2: ジェネリクス指定（複雑）
```typescript
getJson: jest.fn<Promise<any>, []>().mockResolvedValue(null),
```
**結果**: 動作するが冗長で保守性が低い

## 再発防止策

### 1. Jest Mock のベストプラクティス
```typescript
// 推奨: 明示的な Promise 作成
const mockFn = jest.fn(() => Promise.resolve(value))

// 非推奨: 型推論に依存
const mockFn = jest.fn().mockResolvedValue(value)
```

### 2. CI 環境での型チェック強化
- jest.config.js で TypeScript strict mode を有効化
- 型エラーの早期発見

### 3. テスト時の型安全性チェック
```typescript
// 型安全なモック作成のヘルパー
const createMockService = <T>(implementation: T): jest.Mocked<T> => 
  implementation as jest.Mocked<T>
```

## 関連技術情報

### TypeScript + Jest の型推論問題
- Jest の mock 関数は generics を使用して戻り値型を決定
- `mockResolvedValue()` は `MockedFunction<() => Promise<T>>` を期待
- 型情報が不足すると `never` 型として推論される

### CI 環境固有の問題
- ローカルとCI で異なる TypeScript 設定
- CI では `--strict` モードが有効な場合がある
- Jest の TypeScript integration における環境差異

## 学んだ教訓

1. **仮説は段階的に検証する**: 最初の仮説（linting）にとらわれず、CI ログを詳細に分析することが重要

2. **CI とローカルの環境差異を考慮**: 同じコマンドでも環境によって異なる結果になる可能性

3. **TypeScript の型推論を理解**: Jest mock における型推論の仕組みを理解し、明示的な型指定を行う

4. **段階的なデバッグ**: 複数の問題が混在している場合、一つずつ解決していく

## 関連リンク

- [Jest TypeScript Configuration](https://jestjs.io/docs/getting-started#using-typescript)
- [TypeScript never type](https://www.typescriptlang.org/docs/handbook/2/functions.html#never)
- [GitHub Actions Debugging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/about-monitoring-and-troubleshooting)

## タグ
`#ci-cd` `#jest` `#typescript` `#debugging` `#github-actions` `#mock-testing`