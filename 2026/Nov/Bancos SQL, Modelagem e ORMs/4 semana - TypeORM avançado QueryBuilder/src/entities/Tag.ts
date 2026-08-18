import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./Post";

@Entity({ name: "tags" })
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true, length: 50 })
  name!: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts!: Post[];
}
