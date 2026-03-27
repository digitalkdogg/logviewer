-- Adminer 4.8.1 MySQL 5.5.5-10.3.28-MariaDB dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `child_events`;
CREATE TABLE `child_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `step_id` int(11) DEFAULT NULL,
  `log` text DEFAULT NULL,
  `log_type` enum('stdout','stderr') DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `step_id` (`step_id`),
  CONSTRAINT `child_events_ibfk_1` FOREIGN KEY (`step_id`) REFERENCES `steps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `deployments`;
CREATE TABLE `deployments` (
  `id` char(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `step_id` int(11) DEFAULT NULL,
  `event_type` enum('start','finish','error') DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `step_id` (`step_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`step_id`) REFERENCES `steps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `events` (`id`, `step_id`, `event_type`, `created_at`) VALUES
(1,	1,	'start',	'2026-03-23 16:46:54'),
(2,	1,	'finish',	'2026-03-23 16:46:55'),
(3,	2,	'start',	'2026-03-23 16:46:55'),
(4,	2,	'finish',	'2026-03-23 16:55:07'),
(5,	3,	'start',	'2026-03-23 16:55:07'),
(6,	3,	'finish',	'2026-03-23 16:55:11'),
(7,	4,	'start',	'2026-03-23 16:55:12'),
(8,	4,	'finish',	'2026-03-23 16:55:12'),
(9,	5,	'start',	'2026-03-23 16:55:12'),
(10,	5,	'finish',	'2026-03-23 17:01:38'),
(11,	6,	'start',	'2026-03-23 17:01:38'),
(12,	6,	'finish',	'2026-03-23 17:01:46');

DROP TABLE IF EXISTS `steps`;
CREATE TABLE `steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deployment_id` char(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` enum('pending','running','success','failed') DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `duration_ms` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `deployment_id` (`deployment_id`),
  CONSTRAINT `steps_ibfk_1` FOREIGN KEY (`deployment_id`) REFERENCES `deployments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- 2026-03-23 23:25:12
