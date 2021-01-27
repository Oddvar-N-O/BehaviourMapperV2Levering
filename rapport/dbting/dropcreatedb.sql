-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema behaviormapper
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema behaviormapper
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `behaviormapper` DEFAULT CHARACTER SET utf8 ;
USE `behaviormapper` ;

-- -----------------------------------------------------
-- Table `behaviormapper`.`bruker`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `behaviormapper`.`bruker` (
  `brukerID` INT NOT NULL AUTO_INCREMENT,
  `feideinfo` VARCHAR(45) NULL,
  PRIMARY KEY (`brukerID`),
  UNIQUE INDEX `brukerID_UNIQUE` (`brukerID` ASC) VISIBLE,
  UNIQUE INDEX `feideinfo_UNIQUE` (`feideinfo` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `behaviormapper`.`kart`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `behaviormapper`.`kart`;
CREATE TABLE IF NOT EXISTS `behaviormapper`.`kart` (
  `kartID` INT NOT NULL AUTO_INCREMENT,
  `navn` VARCHAR(45) NOT NULL,
  `startdato` DATETIME NULL,
  `sluttdato` DATETIME NULL,
  `zoom` VARCHAR(45) NULL,
  `bruker_brukerID` INT NOT NULL,
  PRIMARY KEY (`kartID`),
  UNIQUE INDEX `kartID_UNIQUE` (`kartID` ASC) VISIBLE,
  INDEX `fk_kart_bruker_idx` (`bruker_brukerID` ASC) VISIBLE,
  CONSTRAINT `fk_kart_bruker`
    FOREIGN KEY (`bruker_brukerID`)
    REFERENCES `behaviormapper`.`bruker` (`brukerID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `behaviormapper`.`person`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `behaviormapper`.`person`;
CREATE TABLE IF NOT EXISTS `behaviormapper`.`person` (
  `personID` INT NOT NULL AUTO_INCREMENT,
  `kartID` VARCHAR(45) NOT NULL,
  `synlig` TINYINT NOT NULL,
  `farge` VARCHAR(45) NULL,
  `deltakende_attributter` VARCHAR(45) NULL,
  PRIMARY KEY (`personID`),
  UNIQUE INDEX `personID_UNIQUE` (`personID` ASC) VISIBLE,
  UNIQUE INDEX `kartID_UNIQUE` (`kartID` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `behaviormapper`.`hendelse`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `behaviormapper`.`hendelse`;
CREATE TABLE IF NOT EXISTS `behaviormapper`.`hendelse` (
  `hendelseID` INT NOT NULL AUTO_INCREMENT,
  `beskrivelse` VARCHAR(45) NULL,
  `retning` DECIMAL NULL,
  `center_koordinat` VARCHAR(45) NULL,
  `tidspunkt` TIME NULL,
  `synlig` TINYINT NULL,
  `person_personID` INT NOT NULL,
  PRIMARY KEY (`hendelseID`),
  UNIQUE INDEX `hendelseID_UNIQUE` (`hendelseID` ASC) VISIBLE,
  INDEX `fk_hendelse_person1_idx` (`person_personID` ASC) VISIBLE,
  CONSTRAINT `fk_hendelse_person1`
    FOREIGN KEY (`person_personID`)
    REFERENCES `behaviormapper`.`person` (`personID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `behaviormapper`.`kart_has_person`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `behaviormapper`.`kart_has_person`;
CREATE TABLE IF NOT EXISTS `behaviormapper`.`kart_has_person` (
  `kart_kartID` INT NOT NULL,
  `person_personID` INT NOT NULL,
  PRIMARY KEY (`kart_kartID`, `person_personID`),
  INDEX `fk_kart_has_person_person1_idx` (`person_personID` ASC) VISIBLE,
  INDEX `fk_kart_has_person_kart1_idx` (`kart_kartID` ASC) VISIBLE,
  CONSTRAINT `fk_kart_has_person_kart1`
    FOREIGN KEY (`kart_kartID`)
    REFERENCES `behaviormapper`.`kart` (`kartID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_kart_has_person_person1`
    FOREIGN KEY (`person_personID`)
    REFERENCES `behaviormapper`.`person` (`personID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
