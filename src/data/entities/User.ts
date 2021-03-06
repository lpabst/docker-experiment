import { Entity, Column, PrimaryColumn, Index } from "typeorm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ForbiddenError } from "../../middleware/errorHandler";
import { JwtTokens } from "../../types/services/JwtTokens";
import BaseEntity from "./BaseEntity";

@Entity()
export default class User extends BaseEntity {
  @PrimaryColumn({ type: "varchar", length: 32 })
  id: string;

  @Column({ type: "varchar", length: 64 })
  firstName: string;

  @Column({ type: "varchar", length: 64 })
  lastName: string;

  @Column({ type: "varchar", length: 256 })
  @Index({ unique: true })
  email: string;

  @Column({ type: "varchar", length: 256 })
  passwordHash: string;

  @Column({ type: "boolean", default: false })
  emailVerified: boolean;

  @Column({ type: "varchar", length: 128, nullable: true })
  streetAddress: string;

  @Column({ type: "varchar", length: 64, nullable: true })
  city: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  state: string;

  @Column({ type: "varchar", length: 16, nullable: true })
  zip: string;

  async validatePassword(inputPassword: string): Promise<void> {
    const passwordIsMatch = await bcrypt.compare(
      inputPassword,
      this.passwordHash
    );
    if (!passwordIsMatch) {
      console.log(
        `Invalid password attempt for user. id: ${this.id}, email: ${this.email}`
      );
      throw ForbiddenError("Invalid email or password");
    }
  }

  throwErrorIfEmailNotVerified() {
    if (!this.emailVerified) {
      throw ForbiddenError("Email Not Verified");
    }
  }

  generateJwtTokens(): JwtTokens {
    const jwtTokens = {
      accessToken: this.generateAccessToken(),
      idToken: this.generateIdToken(),
    };
    return jwtTokens;
  }

  generateAccessToken(): string {
    const accessTokenDuration = 60 * 60;
    const accessToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + accessTokenDuration,
        userId: this.id,
        email: this.email,
        tokenType: "accessToken",
      },
      process.env.JWT_SECRET!
    );
    return accessToken;
  }

  generateIdToken(): string {
    const idToken = jwt.sign(
      {
        userId: this.id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        tokenType: "idToken",
      },
      process.env.JWT_SECRET!
    );
    return idToken;
  }
}
