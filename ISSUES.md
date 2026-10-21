# TechPulse AI — état de stabilisation

Dernière revue statique : 2026-10-21  
Branche de référence examinée : `feature/nextjs-migration`  
Branche de correction : `chore/techpulse-cleanup-baseline`

Ce document remplace les notes d'audit antérieures qui mélangeaient des constats actuels et des hypothèses de migration. Les éléments marqués « à vérifier » nécessitent une exécution ou un test, pas seulement une lecture du code.

## P0 — Sécurité et confidentialité

- [ ] Ajouter des tests de non-régression sur la visibilité des revues.
- [x] Filtrer la route `GET /api/reviews` selon la visibilité et la session.
- [x] Restreindre la recherche aux revues publiques et aux revues de l'utilisateur connecté.
- [x] Ignorer l'identifiant utilisateur fourni par le client pour définir les droits de recherche.
- [x] Limiter les statistiques aux revues publiques pour les visiteurs anonymes et aux revues propres pour les utilisateurs connectés.
- [x] Appliquer la même règle d'accès à la page de détail des revues.
- [x] Remplacer le rendu HTML brut de l'analyse IA par du texte.
- [ ] Auditer les accès des routes tendances, tags, commentaires et partage.
- [ ] Vérifier les secrets présents dans les réglages et les intégrations.
- [ ] Ajouter une protection contre l'abus des routes publiques de comptage.

## P1 — Données et métier

- [ ] Comparer le schéma Prisma avec toutes les migrations versionnées et une base de test.
- [ ] Définir si une revue est unique par date globalement ou par utilisateur et date.
- [ ] Persister la revue générée avant de retourner une réussite au client.
- [ ] Éviter de partager des résultats de cache personnalisés entre utilisateurs.
- [ ] Valider le JSON des métadonnées IA avec un schéma dédié.
- [ ] Récupérer et vérifier les sources réelles au lieu de retourner systématiquement une liste vide.
- [ ] Valider que les liens de partage donnent accès à la ressource attendue et à aucune autre.

## P1 — Qualité et livraison

- [x] Mettre à jour le README pour refléter Next.js, Prisma, PostgreSQL et pnpm.
- [x] Remplacer le workflow CI principal hérité par des contrôles explicites : Prisma, TypeScript, Vitest, build et audit de dépendances.
- [x] Mettre à jour le scan de sécurité pour utiliser pnpm plutôt que des dossiers `client/` et `server/`.
- [x] Retirer le workflow de qualité redondant qui ciblait l'ancienne structure.
- [x] Retirer le workflow de déploiement factice qui n'exécutait pas de déploiement.
- [ ] Exécuter la CI sur un runner propre et corriger les erreurs révélées.
- [ ] Corriger la configuration ESLint et rendre le lint bloquant.
- [ ] Reconfigurer les tests E2E avec Playwright et un serveur Next.js réellement démarré.
- [ ] Définir un workflow de déploiement réel après confirmation de la cible et des secrets.

## P2 — Interface et maintenance

- [x] Connecter les actions de partage, d'impression, de copie et de téléchargement Markdown de la page de détail à des gestionnaires réels.
- [ ] Remplacer les données fictives du tableau de bord par les données réelles.
- [ ] Connecter le champ de recherche de la page d'accueil au parcours de recherche.
- [ ] Aligner les documents d'architecture et d'installation sur le code actuel.
- [ ] Auditer les dépendances inutilisées et les bibliothèques lourdes avant de les supprimer.
- [ ] Réduire les usages non nécessaires de `any`.
- [ ] Clarifier le nom produit officiel : Eureka AI ou TechPulse AI.

## Résultats de la première vague

La branche `chore/techpulse-cleanup-baseline` contient des corrections de confidentialité sur plusieurs lectures, une page de détail plus sûre, des actions de revue fonctionnelles, un README actualisé et des workflows alignés sur la structure courante.

**Validation non effectuée :** les tests, le typecheck, le lint, le build et les workflows CI n'ont pas été exécutés dans un environnement Node.js durant cette intervention. Les cases cochées décrivent les changements apportés au code, pas une validation runtime réussie.

Aucune migration de base de données n'a été appliquée et aucune branche de production n'a été modifiée.
