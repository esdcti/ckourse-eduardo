# Publicação na Google Play Store — Checklist

---

## Pré-requisitos

- [ ] Conta Google Play Developer criada ($25 USD / ~R$125)
  - https://play.google.com/console/signup
- [ ] Aceitar Developer Distribution Agreement
- [ ] Configurar perfil de pagamento (para receber)

---

## Assets Necessários

### Ícone do App
- [ ] Hi-res icon: 512×512 px, PNG, 32-bit
- [ ] Adaptive icon layers (foreground + background)
- [ ] Ícone sem texto (funciona em qualquer tamanho)

### Screenshots
- [ ] Mínimo 2 screenshots por tipo de device
- [ ] Phone: 16:9 ou 9:16, entre 320px e 3840px
- [ ] Screenshots reais do app (não mockups puros)
- [ ] Sugestão: Dashboard, Player, Notas, Progresso

### Feature Graphic
- [ ] 1024×500 px, PNG ou JPG
- [ ] Mostra na parte superior do listing

### Textos
- [ ] Título: máximo 30 caracteres
  - Sugestão: "Ckourse - Video Course Player"
- [ ] Descrição curta: máximo 80 caracteres
  - Sugestão: "Player offline para cursos baixados. Progresso, notas e organização."
- [ ] Descrição completa: máximo 4000 caracteres (ver abaixo)

---

## Descrição Completa (Rascunho)

```
📚 Ckourse — Seu player de cursos offline

Organize e assista seus cursos baixados com tracking de progresso, notas timestamped e estatísticas de aprendizado.

✅ FUNCIONALIDADES:
• Importe qualquer pasta com vídeos como um curso organizado
• Acompanhe seu progresso aula por aula
• Faça anotações com timestamps clicáveis
• Favoritos e bookmarks para acesso rápido
• Suporte a legendas (SRT/VTT)
• Estatísticas detalhadas de aprendizado
• Sequência de dias (streak) para manter a consistência
• 100% offline — sem internet necessária

📱 GRATUITO:
• Até 2 cursos completos sem limitações
• Player com controles completos
• Notas, progresso e favoritos

⭐ PRO (pagamento único):
• Cursos ilimitados
• Export de notas em Markdown
• Estatísticas avançadas
• Todos os temas visuais

🔒 PRIVACIDADE:
• Todos os dados ficam no seu dispositivo
• Sem conta, sem cadastro, sem tracking
• Sem conexão com internet necessária

Perfeito para quem baixa cursos de programação, DevOps, cloud, design e quer uma experiência organizada de estudo no celular.
```

---

## Configurações do App

### Categorização
- [ ] Categoria: Education
- [ ] Subcategoria: N/A
- [ ] Tags: "offline", "course", "video player", "education", "progress tracking"

### Content Rating
- [ ] Preencher questionário IARC
- [ ] Rating esperado: Everyone (PEGI 3 / ESRB E)

### Target Audience
- [ ] Faixa etária: 18+ (não é app para crianças)
- [ ] Marcar "Not designed for children"

### Pricing
- [ ] App: Gratuito (com in-app purchase)
- [ ] In-app product: `ckourse_pro_lifetime` — R$29,90

### Privacy Policy
- [ ] Criar página simples com política de privacidade
- [ ] Hospedar em URL pública (GitHub Pages serve)
- [ ] Conteúdo: "Não coletamos dados. Tudo fica local no dispositivo."

---

## Build para Release

```bash
# Gerar AAB (Android App Bundle) assinado
npm run tauri android build

# Ou via Android Studio para assinar manualmente
```

### Keystore
- [ ] Gerar keystore para assinar releases:
```bash
keytool -genkey -v -keystore ckourse-release.keystore -alias ckourse -keyalg RSA -keysize 2048 -validity 10000
```
- [ ] **NUNCA commitar o keystore no git!**
- [ ] Guardar backup seguro (perder = não pode mais atualizar o app)

---

## Checklist de Submissão

- [ ] AAB gerado e assinado
- [ ] Todos os assets uploaded
- [ ] Descrição em português e inglês
- [ ] Content rating preenchido
- [ ] Privacy policy URL configurada
- [ ] In-app product configurado na Play Console
- [ ] Testar compra com test track (internal testing)
- [ ] Revisar: permissões declaradas no AndroidManifest
  - `READ_EXTERNAL_STORAGE` (ou SAF sem permissão)
  - `BILLING`
- [ ] Submeter para review

---

## Pós-Publicação

- [ ] Monitorar reviews nos primeiros 7 dias
- [ ] Responder reviews negativas rapidamente
- [ ] Verificar crash reports no Android Vitals
- [ ] Configurar staged rollout (10% → 50% → 100%)

---

## ASO (App Store Optimization)

### Keywords prioritárias:
- "course player offline"
- "video course tracker"  
- "offline video player courses"
- "aulas offline"
- "player de cursos"
- "progresso cursos"

### Título localizado:
- EN: "Ckourse - Offline Course Player"
- PT-BR: "Ckourse - Player de Cursos Offline"

### Estratégia:
1. Publicar com listing otimizado
2. Pedir reviews para users engajados (após 7 dias de uso)
3. A/B test no feature graphic após 500+ downloads
4. Adicionar screenshots com texto explicativo
