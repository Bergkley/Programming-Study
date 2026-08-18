import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", unique: true, length: 150 })
  email!: string;

  @Column({ type: "varchar", nullable: true, length: 100 })
  city!: string | null;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];
}
