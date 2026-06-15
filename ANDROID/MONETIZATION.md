# Monetização — Ckourse Mobile

Estratégia freemium para o Ckourse Android.

---

## Modelo

| Tier | Preço | Limites |
|------|-------|---------|
| **Free** | R$0 | Até 2 cursos importados |
| **Pro** | R$29,90 (lifetime) | Cursos ilimitados |

### Por que lifetime e não assinatura:
- App 100% offline — não há custo de servidor recorrente
- Público-alvo resiste a assinaturas para ferramentas simples
- Lifetime gera reviews positivas ("paguei uma vez, funciona pra sempre")
- Menor friction → maior conversão

---

## O que é limitado no Free

| Feature | Free | Pro |
|---------|------|-----|
| Importar cursos | Até 2 | Ilimitado |
| Player de vídeo | ✅ Completo | ✅ Completo |
| Progresso/tracking | ✅ Completo | ✅ Completo |
| Notas | ✅ Completo | ✅ Completo |
| Bookmarks/favoritos | ✅ Completo | ✅ Completo |
| Legendas | ✅ Completo | ✅ Completo |
| Export de notas (Markdown) | ❌ | ✅ |
| Estatísticas avançadas | Básico | ✅ Completo |
| Temas/cores | 1 tema | ✅ Todos |

### Filosofia:
- O Free é **genuinamente útil** — não é um demo crippled
- O limite de 2 cursos é natural: quem estuda sério tem muitos cursos
- A conversão acontece organicamente quando o user tenta importar o 3º curso

---

## Implementação do Gate

### Backend (Rust):
```rust
pub fn can_import_course(db: &Connection) -> Result<bool, String> {
    let count: i64 = db.query_row(
        "SELECT COUNT(*) FROM courses",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    
    let is_pro = get_pro_status(db)?;
    
    Ok(is_pro || count < 2)
}
```

### Frontend (React):
```tsx
function ImportCourse() {
  const canImport = await invoke("can_import_course");
  
  if (!canImport) {
    return <UpgradePaywall />;
  }
  
  // ... fluxo normal de importação
}
```

---

## Tela de Upgrade (Paywall)

Design simples e direto:

```
┌─────────────────────────────────┐
│                                 │
│     🎓 Desbloqueie o Pro       │
│                                 │
│  Você atingiu o limite de       │
│  2 cursos no plano gratuito.    │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ✅ Cursos ilimitados     │  │
│  │  ✅ Export de notas       │  │
│  │  ✅ Estatísticas completas│  │
│  │  ✅ Todos os temas        │  │
│  │  ✅ Pagamento único       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Comprar Pro - R$29,90   │  │
│  │     (pagamento único)     │  │
│  └───────────────────────────┘  │
│                                 │
│  Já comprou? Restaurar compra   │
│                                 │
└─────────────────────────────────┘
```

---

## Google Play Billing — Integração

### Tipo de produto:
- **In-App Product** (não subscription)
- Product ID: `ckourse_pro_lifetime`
- Tipo: "Managed product" (non-consumable)

### Fluxo técnico:
1. App verifica `BillingClient.isReady()`
2. Chama `queryProductDetailsAsync("ckourse_pro_lifetime")`
3. Mostra preço real (Google retorna o preço localizado)
4. `launchBillingFlow()` abre o modal do Google
5. Recebe `PurchasesUpdatedListener` com o resultado
6. Valida assinatura localmente (RSA com chave pública do app)
7. Salva no SQLite: `UPDATE settings SET is_pro = 1`

### Restore Purchase:
- `queryPurchasesAsync()` verifica se já comprou em outro device
- Importante para users que reinstalam ou trocam de celular

---

## Pricing Research

### Concorrentes (apps de produtividade/estudo):
| App | Modelo | Preço |
|-----|--------|-------|
| Anki (Android) | Free + Pro | $25 (lifetime) |
| Forest (focus) | One-time | R$15,90 |
| Notion | Freemium/sub | R$0-50/mês |
| Todoist Pro | Subscription | R$18/mês |

### Posicionamento:
- R$29,90 lifetime é competitivo — mais barato que 2 meses de qualquer subscription
- Para mercado internacional: $4.99-$9.99 USD
- Google Play permite pricing diferenciado por região

---

## Projeção Financeira (Conservadora)

### Premissas:
- 1000 downloads/mês (orgânico, ASO básico)
- 5% taxa de conversão free→pro
- R$29,90 preço × 70% (Google fica com 15-30%)

### Receita mensal:
```
1000 downloads × 5% conversão = 50 compras/mês
50 × R$29,90 × 0.70 = ~R$1.047/mês (líquido)
```

### Cenário otimista (após 6 meses com reviews e ASO):
```
5000 downloads × 7% conversão = 350 compras/mês
350 × R$29,90 × 0.70 = ~R$7.325/mês
```

### Investimento:
- Tempo de desenvolvimento: 5-8 semanas
- Google Play Developer: R$125 (uma vez)
- Custo operacional: R$0/mês (app offline)

**Break-even: ~1 mês** após publicação (no cenário conservador).

---

## Anti-Piracy (Básico)

O app é offline, então pirataria via APK crackeado é inevitável. Mitigações:

1. **Verificação de assinatura** — checa se o APK não foi tampered
2. **Google Play Licensing** — verifica se o download veio da Play Store
3. **Ofuscação** — ProGuard/R8 dificulta reverse engineering
4. **Aceitar a realidade** — quem pirateia não ia pagar de qualquer forma. Foque em quem paga.

A melhor "proteção" é fazer o app tão bom e barato que não vale o trabalho de piratear.
