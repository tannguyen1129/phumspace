/**
 * Milestone M9 (GD2): Organization self-service — FR-ORG-001/002/005/006 (SHOULD/R2).
 * M8 chi cho SYSTEM_ADMIN tao to chuc (FR-ORG-003/004, MUST/R1). M9 mo cho moi REGISTERED_USER
 * tu gui yeu cau tao to chuc (PENDING_APPROVAL) roi SYSTEM_ADMIN duyet/tu choi (REJECTED) —
 * dung theo dung câu FR-ORG-001 "System Admin phai co the tao/duyet organization".
 *
 * brand_color: FR-ORG-006 "R2 co the ho tro branding nhe nhung khong duoc che khuat nguon/nhan
 * xac minh cua PhumData" — chi 1 mau hex, khong co logo upload (giu scope nhe, tranh phinh to
 * MediaStorageService cho 1 tinh nang COULD/R2 thap nhat uu tien).
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.dropConstraint({ schema: "iam", name: "organizations" }, "organizations_status_check");
  pgm.addConstraint({ schema: "iam", name: "organizations" }, "organizations_status_check", {
    check: "status IN ('PENDING_APPROVAL','ACTIVE','SUSPENDED','REJECTED')",
  });

  pgm.addColumn({ schema: "iam", name: "organizations" }, {
    brand_color: { type: "text" },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn({ schema: "iam", name: "organizations" }, "brand_color");
  pgm.dropConstraint({ schema: "iam", name: "organizations" }, "organizations_status_check");
  pgm.addConstraint({ schema: "iam", name: "organizations" }, "organizations_status_check", {
    check: "status IN ('ACTIVE','SUSPENDED')",
  });
};
