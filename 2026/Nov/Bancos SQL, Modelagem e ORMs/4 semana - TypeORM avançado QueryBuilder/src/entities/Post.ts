import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Tag } from "./Tag";
import { User } from "./User";

@Entity({ name: "posts" })
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "boolean", default: false })
  published!: boolean;

  @Column({ type: "integer", default: 0 })
  views!: number;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt!: Date;

  @Column({ type: "integer", name: "author_id" })
  authorId!: number;

  @ManyToOne(() => User, (user) => user.posts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "author_id" })
  author!: User;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: "post_tags",
    joinColumn: { name: "post_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags!: Tag[];
}
