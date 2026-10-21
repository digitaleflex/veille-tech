# Backlog d'issues — TechPulse AI
> Préparé le 2026-10-21 à partir de l'audit de la branche `chore/techpulse-cleanup-baseline`.
> Les issues GitHub ne peuvent pas être créées tant que la fonctionnalité Issues est désactivée dans les paramètres du dépôt. Ce document est un backlog de secours, pas un substitut à des issues GitHub distinctes.

## Ordre d'exécution recommandé

1. **P0 — CI et build reproductible**
2. **P0 — Tests d'autorisation et confidentialité**
3. **P0 — Persistance des revues générées**
4. **P0 — Isolation du cache IA**
5. **P1 — Sources d'actualité vérifiables**
6. **P1 — Cohérence Prisma/migrations**
7. **P1 — Audit des API**
8. **P1 — Limitation de débit et budgets IA**
9. **P1 — Alignement des dépendances et outils**
10. **P1 — Audit et suppression prudente des dépendances**
11. **P2 — Dashboard basé sur les données réelles**
12. **P2 — Audit des parcours UI**
13. **P2 — Documentation technique**
14. **P2 — Observabilité respectueuse de la confidentialité**

---

## ISSUE 01 — [P0][CI] Exécuter et fiabiliser la chaîne de validation

### Contexte
La PR #1 remplace des workflows hérités, mais les contrôles runtime n'ont pas été exécutés dans un runner propre. Le statut Vercel observé sur le dernier SHA connu était en échec. Le code d'un workflow ne prouve pas que le projet compile.

### Objectif
Obtenir une validation reproductible de la branche de nettoyage, sans secrets réels ni base de production.

### Tâches
- Vérifier versions Node/pnpm, scripts `package.json` et cohérence du lockfile.
- Exécuter `pnpm install --frozen-lockfile`, Prisma validate, typecheck, tests, lint, build et audit.
- Exécuter chaque contrôle séparément pour isoler la première erreur.
- Lire les logs Vercel et déterminer si l'échec provient de la compilation, des variables d'environnement ou de la configuration.
- Corriger les causes racines; ne pas rendre les étapes tolérantes à l'échec pour obtenir une CI verte.
- Utiliser uniquement des variables factices pour les contrôles ne nécessitant aucun service externe.

### Critères d'acceptation
- [ ] Installation gelée réussie sans modification implicite du lockfile.
- [ ] Prisma validate, typecheck, lint, tests et build passent sur un runner propre.
- [ ] Audit de dépendances exécuté; toute exception documentée.
- [ ] Cause du statut Vercel comprise et corrigée, ou dépendance externe clairement établie.
- [ ] Aucune clé réelle ni base de production utilisée.
- [ ] La PR reste en brouillon jusqu'à validation.

### Hors périmètre
Déploiement production et migrations de base réelle.

---

## ISSUE 02 — [P0][Sécurité] Tests de non-régression des droits d'accès aux revues

### Contexte
La PR #1 modifie les lectures des revues, la recherche, les statistiques et la page détail. Ces protections doivent être démontrées par des tests.

### Scénarios requis
- Anonyme : ne lit que les revues explicitement publiques.
- Utilisateur A : lit ses revues privées et les revues publiques.
- Utilisateur B : ne peut pas lire les revues privées de A, même via URL directe ou identifiant connu.
- Recherche : un `userId` transmis par le client ne change jamais l'identité de session.
- Statistiques : aucune information agrégée ne révèle les revues privées d'un autre utilisateur.
- Session expirée, ID invalide et revue inexistante : réponses contrôlées sans fuite de données.

### Tâches
- Créer des fixtures avec deux utilisateurs et des revues publiques/privées.
- Ajouter des tests unitaires des fonctions d'autorisation et tests API observables.
- Vérifier codes HTTP, corps de réponse, métadonnées et messages d'erreur.
- Exécuter les tests en CI sans service externe ni données de production.

### Critères d'acceptation
- [ ] Tous les scénarios ci-dessus sont automatisés.
- [ ] Les tests échouent si un filtre de propriété/publication est retiré.
- [ ] Aucun contenu privé ne fuite dans les erreurs ou les agrégats.
- [ ] Tests déterministes, indépendants de l'ordre d'exécution.

---

## ISSUE 03 — [P0][Génération IA] Garantir la persistance avant le succès HTTP

### Contexte
`app/api/generate/route.ts` combine session Better Auth, Gemini, Prisma et cache. Le flux de cache doit être vérifié : un cache hit semble susceptible de renvoyer un nouvel identifiant sans revue durable correspondante.

### Tâches
- Documenter le flux authentification → validation → cache → fournisseur IA → validation de sortie → persistance → réponse.
- Définir la règle métier d'identité et d'unicité d'une revue avant toute contrainte SQL.
- Persister la revue et ses métadonnées avant de retourner un succès.
- Sur cache hit, réutiliser une revue persistée valide ou persister explicitement une nouvelle revue.
- Gérer les appels concurrents, doublons, erreurs fournisseur, réponses vides, timeouts et erreurs DB.
- Ajouter des logs structurés sans clés, prompts sensibles ni contenu privé excessif.

### Critères d'acceptation
- [ ] Toute réponse de succès correspond à une revue persistée.
- [ ] Une erreur de persistance ne renvoie jamais un faux succès.
- [ ] Cache hit et cache miss ont un comportement documenté et testé.
- [ ] Les requêtes concurrentes n'entraînent pas de doublons inattendus.
- [ ] Tests pour succès, erreur IA, erreur DB, cache et concurrence.
- [ ] Aucun changement de production requis pour les tests.

---

## ISSUE 04 — [P0][Confidentialité] Isoler le cache selon les paramètres et l'identité

### Contexte
La clé de cache observée utilise la date et `aiPreferences`, sans identité utilisateur visible. Si la sortie est personnalisée, la réutilisation inter-utilisateurs doit être interdite sauf décision explicite de partager une ressource publique.

### Tâches
- Inventorier les paramètres qui changent le résultat : utilisateur, date, langue, catégories, ton, profondeur, modèle et version du prompt.
- Décider quelles réponses sont réellement partageables et lesquelles sont privées.
- Normaliser les paramètres avant de calculer la clé.
- Versionner les clés pour invalider proprement les anciennes entrées.
- Définir TTL, taille maximale, comportement de cache corrompu et gestion d'erreur.
- Ne pas incorporer de secret ni de données personnelles lisibles dans la clé.

### Critères d'acceptation
- [ ] Politique de cache documentée.
- [ ] Préférences différentes ne provoquent pas de collisions indésirables.
- [ ] Aucun contenu privé n'est partagé via le cache.
- [ ] Tests pour utilisateurs différents, dates, préférences et versions de prompt.
- [ ] Invalidation des anciennes entrées contrôlée.

---

## ISSUE 05 — [P1][Sources] Implémenter une collecte de sources réelles et vérifiables

### Contexte
Demander à un modèle de rechercher des actualités dans le prompt ne garantit pas que la recherche est activée ni que les liens fournis sont authentiques.

### Tâches
- Inspecter `lib/gemini.ts`, les SDK installés et les métadonnées de grounding disponibles.
- Vérifier l'activation réelle du grounding/recherche pour le modèle choisi.
- Définir le contrat d'une source : URL, titre, domaine/éditeur, date de publication si disponible, date de collecte et provenance.
- Valider URL HTTPS/HTTP, doublons, champs requis et correspondance entre article et source.
- Distinguer date de publication et date de collecte.
- Ne jamais inventer d'URL, de média, de citation ou de date.
- Prévoir un état explicite lorsque le fournisseur ne renvoie pas de source.

### Critères d'acceptation
- [ ] Sources issues de métadonnées réelles ou d'un collecteur identifié.
- [ ] Liens valides, doublons supprimés et provenance conservée.
- [ ] Aucune revendication de vérification web sans preuve de grounding.
- [ ] Dates inconnues affichées comme inconnues.
- [ ] Tests de grounding absent, incomplet, URL invalide et doublons.
- [ ] Documentation et interface décrivent honnêtement les capacités.

---

## ISSUE 06 — [P1][Prisma] Réconcilier schéma et migrations sur une base de test

### Contexte
Le schéma contient plusieurs modèles métier et d'authentification, mais l'historique de migrations visible paraît limité. Les suppressions d'endpoints ne justifient pas automatiquement la suppression des tables correspondantes.

### Tâches
- Comparer `prisma/schema.prisma` à toutes les migrations versionnées.
- Vérifier modèles, index, contraintes, relations, valeurs par défaut et champs obligatoires.
- Créer une base PostgreSQL jetable et appliquer les migrations depuis zéro.
- Comparer le schéma obtenu au schéma Prisma et documenter chaque dérive.
- Proposer des migrations additives avant toute opération destructive.
- Vérifier les modèles liés aux endpoints retirés (notifications, intégrations, partage, compteurs) avant de décider de leur sort.
- Documenter sauvegarde, vérification et rollback pour un futur déploiement.

### Garde-fous
Ne jamais lancer `migrate reset`, `db push` ou une migration destructive sur la production. Ne pas copier de données personnelles de production dans les tests.

### Critères d'acceptation
- [ ] Base de test neuve construite uniquement par les migrations versionnées.
- [ ] Dérives documentées et corrigées ou acceptées explicitement.
- [ ] Nouvelles migrations versionnées et relues.
- [ ] Aucune migration appliquée en production pendant cette issue.

---

## ISSUE 07 — [P1][API] Auditer autorisation, validation et erreurs des routes restantes

### Objectif
Établir un inventaire de toutes les routes `app/api/**/route.ts` et vérifier chaque méthode, pas seulement la présence d'une session.

### Tâches
- Classer chaque route : publique, données personnelles, mutation, action coûteuse ou intégration.
- Vérifier authentification, propriété de ressource et autorisation côté serveur.
- Valider paramètres, query strings et JSON avec les schémas Zod adaptés.
- Borner pagination, taille de corps, dates et listes.
- Uniformiser les erreurs HTTP sans stack trace, secret ou contenu privé.
- Examiner IDOR, mass assignment, injection, CORS/CSRF et méthodes HTTP inattendues.
- Ne jamais faire confiance à un rôle, statut ou `userId` transmis par le client.
- Produire un tableau route/méthode/auth/autorisation/validation/risque.

### Critères d'acceptation
- [ ] Toutes les routes sont inventoriées et leur politique d'accès est explicite.
- [ ] Mutations sensibles protégées par propriété et validation serveur.
- [ ] Risques élevés couverts par des tests.
- [ ] Routes inutilisées identifiées, mais non supprimées sans vérification de leur usage.

---

## ISSUE 08 — [P1][Sécurité/Coûts] Limitation de débit et quotas pour les opérations coûteuses

### Contexte
La génération IA peut consommer des quotas et engendrer des coûts. Les limites locales en mémoire ne suffisent pas nécessairement sur plusieurs instances.

### Tâches
- Inventorier génération, recherche externe et toutes les opérations coûteuses.
- Définir limites par utilisateur authentifié et par IP lorsque l'accès anonyme est permis.
- Choisir un stockage de compteurs compatible avec l'hébergement multi-instance.
- Borner concurrence, timeout et taille de requête.
- Retourner HTTP 429 de manière cohérente, avec `Retry-After` si pertinent.
- Ajouter un budget fournisseur et empêcher les retries illimités en cas de quota dépassé.
- Garder les clés fournisseur exclusivement côté serveur.
- Documenter les seuils et leur ajustement.

### Critères d'acceptation
- [ ] Toutes les routes coûteuses sont protégées.
- [ ] Limites cohérentes entre instances.
- [ ] Tests du trafic normal, du dépassement et de la concurrence.
- [ ] Erreurs de quota gérées sans boucle de retry.
- [ ] Seuils configurables sans changement du code.

---

## ISSUE 09 — [P1][Compatibilité] Aligner Next.js, React, ESLint et les scripts

### Contexte
Le manifeste observé déclare Next.js 16.x, React 18.x, `eslint-config-next` 14.1.0 et ESLint 8.x; le script lint utilise `next lint`. Cette combinaison exige une vérification de compatibilité et un alignement.

### Tâches
- Vérifier les contraintes peer dependencies et les exigences Node de la version choisie.
- Choisir une combinaison cohérente Next.js/React après inspection du code et des notes de migration.
- Aligner `eslint-config-next` et configurer ESLint explicitement.
- Remplacer `next lint` si non pris en charge par la version retenue.
- Vérifier TypeScript, Tailwind, PostCSS, Vitest et les types React.
- Harmoniser scripts lint, typecheck, test, test:watch, build et start.
- Mettre à jour le lockfile uniquement via pnpm et documenter les commandes.

### Critères d'acceptation
- [ ] Versions compatibles et conflits de peer dependencies expliqués.
- [ ] Installation gelée réussie.
- [ ] Lint valide et bloquant.
- [ ] Tous les scripts du README existent.
- [ ] Typecheck, tests et build passent sur un environnement propre.

---

## ISSUE 10 — [P1][Maintenance] Auditer les dépendances et retirer uniquement les paquets inutilisés

### Candidats à vérifier
Deux SDK Google AI, TensorFlow.js Node, Visx, graphology, ml-regression, D3, MSW, plugin Vite et autres paquets lourds. La liste est une piste d'audit, pas une autorisation de suppression.

### Tâches
- Rechercher les imports directs/indirects, imports dynamiques, alias, scripts et configs.
- Identifier les dépendances utilisées seulement par les fichiers de tendances supprimés.
- Confirmer quel SDK Google est utilisé et si les deux sont nécessaires.
- Vérifier les contraintes de compilation des dépendances natives sur la version Node retenue.
- Supprimer les candidats par lots limités et mettre à jour le lockfile avec pnpm.
- Après chaque lot, exécuter lint, typecheck, tests, build et audit.
- Mesurer l'impact sur le bundle quand cela est pertinent.

### Critères d'acceptation
- [ ] Chaque dépendance directe est classée et justifiée.
- [ ] Toute suppression est étayée par l'analyse des imports et des tests.
- [ ] Installation gelée reproductible.
- [ ] Dépendances natives validées sur la plateforme cible.
- [ ] Aucune bibliothèque serveur inutilement embarquée dans le client.

---

## ISSUE 11 — [P2][Dashboard] Charger la dernière revue persistée et gérer tous les états

### Contexte
Le tableau de bord utilise désormais les statistiques API, mais `lastReview` est passé à `null`. Le widget de dernière revue ne reflète donc pas encore l'historique réel.

### Tâches
- Créer une lecture serveur/API sécurisée de la dernière revue visible pour la session courante.
- Respecter les règles public/propriétaire; ne pas utiliser un identifiant client comme autorité.
- Brancher les données persistées sur le widget.
- Implémenter états chargement, données, aucun résultat, erreur et session expirée.
- Vérifier dates, fuseaux horaires, champs nullables et données historiques partielles.
- Vérifier que chaque lien de reprise pointe vers une revue réellement accessible.
- Supprimer les placeholders restants.

### Critères d'acceptation
- [ ] La revue affichée est la dernière revue persistée de l'utilisateur courant.
- [ ] État vide distinct d'une erreur API.
- [ ] Liens valides et contrôle d'accès conservé.
- [ ] Tests API/UI des états principaux.
- [ ] Aucun contenu d'un autre compte n'apparaît.

---

## ISSUE 12 — [P2][UX] Auditer les parcours recherche, calendrier, favoris et paramètres

### Parcours
Recherche, calendrier, favoris, paramètres, détail de revue, navigation globale et actions de partage/export.

### Tâches
- Inventorier toutes les pages et actions visibles.
- Pour chaque action, identifier l'endpoint et le résultat attendu.
- Vérifier les états chargement, succès, vide, erreur et session expirée.
- Corriger liens cassés, boutons inertes et retours utilisateur absents.
- Vérifier persistance des favoris/paramètres et droits d'accès.
- Ajouter tests composants ou navigateur pour les parcours prioritaires.
- Vérifier responsive, clavier, focus et accessibilité de base.
- Retirer ou désactiver explicitement ce qui n'est pas implémenté plutôt que simuler une fonction.

### Critères d'acceptation
- [ ] Aucun lien interne vers une page inexistante.
- [ ] Aucun bouton visible sans action réelle ou état désactivé explicite.
- [ ] États de chargement/vide/erreur implémentés.
- [ ] Mutations persistées et reflétées dans l'UI.
- [ ] Parcours prioritaires testés ou checklist reproductible fournie.

---

## ISSUE 13 — [P2][Documentation] Actualiser installation, architecture et déploiement

### Tâches
- Auditer tous les fichiers `docs/` et les liens croisés.
- Vérifier commandes pnpm, version Node, variables d'environnement et prérequis PostgreSQL.
- Décrire Better Auth, Prisma, migrations, génération IA, cache et sources selon l'implémentation réelle.
- Distinguer fonctionnalités disponibles, partielles et retirées.
- Documenter les tests locaux/CI et les erreurs fréquentes.
- Documenter le déploiement réel uniquement après confirmation de la plateforme et des secrets requis.
- Créer un tableau des variables : nom, usage, requise/facultative, serveur/client, sans valeurs secrètes.
- Tester les instructions sur un environnement propre.

### Critères d'acceptation
- [ ] Les commandes documentées existent et fonctionnent.
- [ ] Aucun ancien dossier ou workflow présenté comme actif par erreur.
- [ ] Aucun secret réel dans les exemples.
- [ ] Les liens internes sont valides.
- [ ] Les limites et fonctions non disponibles sont explicites.

---

## ISSUE 14 — [P2][Observabilité] Ajouter des logs structurés sans données sensibles

### Contexte
L'ancien endpoint analytics a été retiré car il ne fournissait pas de persistance métier utile. Une observabilité serveur reste nécessaire pour diagnostiquer les échecs.

### Tâches
- Définir les événements : génération démarrée/terminée/échouée, durée, fournisseur, cache hit/miss, erreurs DB et API.
- Ajouter un identifiant de corrélation par requête.
- Uniformiser niveaux et champs de logs.
- Masquer clés API, cookies, headers d'autorisation, prompts sensibles et contenus privés.
- Définir rétention et accès selon l'hébergement.
- Ajouter des métriques agrégées de réussite, latence et erreurs si la plateforme le permet.
- Documenter les étapes de diagnostic.

### Critères d'acceptation
- [ ] Les erreurs sont diagnostiquables sans reproduire systématiquement en production.
- [ ] Aucun secret ni contenu privé complet n'est journalisé.
- [ ] Chaque événement pertinent porte un identifiant de corrélation.
- [ ] Les erreurs fournisseur, DB, validation et limitation de débit sont distinguables.
- [ ] Rétention et accès documentés.
- [ ] Aucun système analytics inutile n'est réintroduit.
