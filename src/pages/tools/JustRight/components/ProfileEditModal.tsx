import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { storageApi } from "@/common/api/storage";
import type { ExtraInfo, UserManual } from "../types";
import { APP_KEY as JUST_RIGHT_APP_KEY } from "../services/api";

type GenderValue = "" | "female" | "male" | "other";

interface ProfileEditModalProps {
  isOpen: boolean;
  manual: UserManual;
  onClose: () => void;
  onSave: (data: Partial<UserManual>) => Promise<void> | void;
}

interface ProfileForm {
  avatar: string;
  gender: GenderValue;
  birthday: string;
  motto: string;
  phone: string;
  nickname: string;
}

const genderOptions: { value: GenderValue; label: string }[] = [
  { value: "female", label: "女" },
  { value: "male", label: "男" },
  { value: "other", label: "其他" },
];

function normalizeGender(value: unknown): GenderValue {
  return value === "female" || value === "male" || value === "other" ? value : "";
}

function trimToOptional(value: string) {
  const next = value.trim();
  return next || undefined;
}

function buildForm(extraInfo?: ExtraInfo): ProfileForm {
  return {
    avatar: typeof extraInfo?.avatar === "string" ? extraInfo.avatar : "",
    gender: normalizeGender(extraInfo?.gender),
    birthday: typeof extraInfo?.birthday === "string" ? extraInfo.birthday : "",
    motto: typeof extraInfo?.motto === "string" ? extraInfo.motto : "",
    phone: typeof extraInfo?.phone === "string" ? extraInfo.phone : "",
    nickname: typeof extraInfo?.nickname === "string" ? extraInfo.nickname : "",
  };
}

export function ProfileEditModal({ isOpen, manual, onClose, onSave }: ProfileEditModalProps) {
  const [form, setForm] = useState<ProfileForm>(() => buildForm(manual.extra_info));
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarPreviewRef = useRef<string | null>(null);

  const replaceAvatarPreview = (url: string | null) => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }
    avatarPreviewRef.current = url;
    setAvatarPreview(url);
  };

  useEffect(() => {
    if (!isOpen) return;

    setForm(buildForm(manual.extra_info));
    replaceAvatarPreview(null);
  }, [isOpen, manual]);

  useEffect(() => {
    return () => replaceAvatarPreview(null);
  }, []);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    const preview = URL.createObjectURL(file);
    replaceAvatarPreview(preview);
    setUploadingAvatar(true);

    try {
      const uploaded = await storageApi.uploadFiles([file], {
        appKey: JUST_RIGHT_APP_KEY,
        compression: {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          fileType: "image/jpeg",
        },
        thumbnail: {
          maxWidthOrHeight: 320,
          fileType: "image/jpeg",
        },
      });
      const avatarUrl = uploaded[0]?.url || uploaded[0]?.resource.url || "";
      if (!avatarUrl) {
        throw new Error("empty avatar url");
      }
      updateField("avatar", avatarUrl);
      toast.success("头像已更新");
    } catch {
      replaceAvatarPreview(null);
      toast.error("头像上传失败");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const phone = form.phone.trim();
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }

    const nextExtraInfo: ExtraInfo = {
      ...manual.extra_info,
      avatar: trimToOptional(form.avatar),
      gender: form.gender || undefined,
      birthday: trimToOptional(form.birthday),
      motto: trimToOptional(form.motto),
      phone: trimToOptional(form.phone),
      nickname: trimToOptional(form.nickname),
    };

    try {
      setSaving(true);
      await onSave({ extra_info: nextExtraInfo });
      toast.success("资料已保存");
      onClose();
    } catch {
      toast.error("资料保存失败");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarPreview || form.avatar;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-stone-900/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[80] max-h-[92vh] overflow-y-auto rounded-t-[2rem] bg-[#FFF8F7] px-6 pb-8 pt-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-800">编辑基本信息</h3>
              <button
                type="button"
                onClick={onClose}
                disabled={saving || uploadingAvatar}
                className="rounded-full bg-white p-2 text-stone-400 shadow-sm disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || saving}
                className="group relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#FFE8E3] shadow-[0_10px_28px_rgba(255,152,116,0.22)] disabled:opacity-60"
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#FF8A65]">
                    {form.nickname.trim().charAt(0) || "我"}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-stone-900/45 py-1.5 text-white">
                  {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </div>
              </button>
              {form.avatar && (
                <button
                  type="button"
                  onClick={() => {
                    replaceAvatarPreview(null);
                    updateField("avatar", "");
                  }}
                  disabled={saving || uploadingAvatar}
                  className="mt-3 text-xs font-medium text-stone-400 disabled:opacity-50"
                >
                  移除头像
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-500">昵称</span>
                <input
                  value={form.nickname}
                  onChange={(event) => updateField("nickname", event.target.value)}
                  disabled={saving}
                  className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#FFB494] disabled:opacity-60"
                  placeholder="怎么称呼你"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-xs font-bold text-stone-500">性别</span>
                <div className="grid grid-cols-3 gap-2">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, gender: option.value }))}
                      disabled={saving}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${
                        form.gender === option.value
                          ? "border-[#FF9874] bg-[#FFF0E5] text-[#FF7A59]"
                          : "border-rose-100 bg-white text-stone-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-500">生日</span>
                <input
                  type="date"
                  value={form.birthday}
                  onChange={(event) => updateField("birthday", event.target.value)}
                  disabled={saving}
                  className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#FFB494] disabled:opacity-60"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-500">座右铭</span>
                <textarea
                  value={form.motto}
                  onChange={(event) => updateField("motto", event.target.value)}
                  disabled={saving}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700 outline-none focus:border-[#FFB494] disabled:opacity-60"
                  placeholder="写一句最近想记住的话"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-stone-500">手机号</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  disabled={saving}
                  inputMode="tel"
                  className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-[#FFB494] disabled:opacity-60"
                  placeholder="仅用于你们的资料展示"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingAvatar}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#FFB494] to-[#FF9874] py-3.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(255,152,116,0.26)] disabled:opacity-60"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : "保存"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
