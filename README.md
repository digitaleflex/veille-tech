# TechPulse AI

> Plateforme de veille technologique assistée par IA : génération, consultation et analyse de revues tech.

**État du dépôt :** application en cours de stabilisation. Les fonctionnalités décrites dans l'historique du projet ne doivent pas toutes être considérées comme opérationnelles sans validation récente.

## Stack actuellement déclarée

- Next.js App Router
- React 18
- TypeScript
- PostgreSQL et Prisma
- Better Auth
- Google Gemini
- Tailwind CSS 3
- pnpm

Les versions exactes sont celles du manifeste `package.json` et du fichier de verrouillage. Le dépôt contient des traces d'une architecture antérieure basée sur Vite et des dossiers `client/` et `server/`; ces références sont en cours de nettoyage.

## Fonctionnalités et état de validation

Le code contient des routes et composants liés à :

- la génération de revues avec Gemini ;
- la consultation et la recherche de revues ;
- les catégories, tags et sources ;
- l'historique, les favoris et les réglages ;
- les statistiques et tendances ;
- les commentaires, notifications et liens de partage ;
- l'authentification et l'export de données.

La présence d'un composant ou d'une route ne garantit pas que le parcours soit complet. La génération persistante, les autorisations, les intégrations et plusieurs interactions d'interface nécessitent une validation spécifique.

## Prérequis

- Une version de Node.js compatible avec la version de Next.js retenue par le projet.
- pnpm, version compatible avec le fichier de verrouillage.
- PostgreSQL.
- Une clé Google Gemini.
- Les variables nécessaires à Better Auth et Resend pour les fonctions d'authentification par e-mail.

## Configuration locale

1. Cloner le dépôt et se placer sur la branche de travail validée.
2. Installer pnpm si nécessaire.
3. Installer les dépendances avec `pnpm install --frozen-lockfile`.
4. Créer un fichier `.env.local` à partir des variables documentées dans la configuration serveur.
5. Configurer une base PostgreSQL **de développement**, jamais une base de production pour les essais.
6. Valider le schéma Prisma avant d'appliquer les migrations.
7. Démarrer l'application avec `pnpm dev`.

Exemple indicatif de variables ; les noms doivent correspondre au code et être harmonisés durant la stabilisation :

```env
DATABASE_URL=
DATABASE_URL_UNPOOLED=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_API_KEY=
RESEND_API_KEY=
RESEND_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Ne commitez jamais de secrets, de jetons ou de fichiers d'environnement réels.

## Commandes

Les scripts disponibles doivent être consultés dans `package.json`. Les commandes de validation seront harmonisées dans le cadre de la remise en état. Ne considérez pas une étape CI comme validée tant qu'elle n'a pas réellement été exécutée avec succès.

## Documentation

Consultez les documents disponibles :

- [Vision et mission](./docs/01-vision-et-mission.md)
- [Vue d'ensemble](./docs/02-vue-ensemble.md)
- [Installation](./docs/03-installation.md)
- [Architecture](./docs/04-architecture.md)
- [API et services](./docs/05-api-services.md)
- [Composants](./docs/06-composants.md)
- [Base de données](./docs/07-database.md)
- [Guide d'utilisation](./docs/08-guide-utilisation.md)
- [Plan de stabilisation](./docs/REMEDIATION_PLAN.md)

Les documents historiques doivent être confrontés au code actuel avant d'être utilisés comme instructions de déploiement.

## Sécurité et livraison

- Ne pas exposer les revues privées via les routes publiques.
- Ne jamais faire confiance à un identifiant utilisateur fourni par le client pour définir les droits d'accès.
- Tester les migrations sur une base isolée avant tout déploiement.
- Exécuter les tests de sécurité, le typecheck, les tests automatisés et le build avant une livraison.
- Les déploiements de production doivent être déclenchés uniquement par un workflow réel et vérifiable.

## Contribution

1. Créer une branche dédiée à la modification.
2. Ajouter ou mettre à jour les tests associés.
3. Exécuter les contrôles disponibles et noter explicitement ceux qui n'ont pas pu être exécutés.
4. Ouvrir une pull request avec le périmètre, les risques et les résultats de validation.
5. Ne pas fusionner une migration de base de données sans plan de déploiement et de retour arrière.

## Licence

Projet privé — tous droits réservés.
