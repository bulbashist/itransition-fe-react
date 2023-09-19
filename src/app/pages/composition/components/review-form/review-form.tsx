import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import Close from "@mui/icons-material/Close";
import { useState, useRef } from "react";
import { FileUploader } from "react-drag-drop-files";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import GalleryComponent from "app/components/utility/review-form-gallery";
import TagsPanelComponent from "app/components/utility/tags-panel";
import { CSSGap, CSSPadding } from "app/styles/constants";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ITag } from "app/types";
import { Theme } from "app/themes/types";
import { ImageServer } from "app/services/image-server";
import { uploadReview } from "../../store/slice";

type FormData = {
  title: string;
  text: string;
};

type Props = {
  closeModal: () => void;
};

export const ReviewFormComponent = ({ closeModal }: Props) => {
  const theme = useAppSelector((state) => state.core.theme);
  const composition = useAppSelector((state) => state.composition);

  const [previewImg, setPreviewImg] = useState("");
  const [tags, setTags] = useState<ITag[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const { handleSubmit, register } = useForm<FormData>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const imgServer = useRef(new ImageServer());

  if (!composition) return null;

  const handleChange = async (f: File) => {
    const url = await imgServer.current.uploadImage(f);
    setPreviewImg(url);
    setImages((ps) => [...ps, url]);
  };

  const loadToGallery = async (f: File) => {
    const url = await imgServer.current.uploadImage(f);
    setImages((ps) => [...ps, url]);
  };

  const formHandler = (data: FormData) => {
    dispatch(
      uploadReview({
        composition: { id: composition.id },
        ...data,
        previewImg,
        tags,
      })
    );
    closeModal();
  };

  return (
    <Dialog open fullWidth={true} maxWidth={false}>
      <Box position="absolute" top={8} right={8}>
        <Close onClick={closeModal} />
      </Box>
      <DialogTitle textAlign="center">
        {t("review_create_form_title")}
      </DialogTitle>
      <Stack direction="column" gap={CSSGap.Average} padding={CSSPadding.Small}>
        <form onSubmit={handleSubmit(formHandler)}>
          <Stack direction="column" gap={CSSGap.Small}>
            <Input
              placeholder={t("review_form_title_ph")}
              {...register("title")}
              sx={{ width: "300px", alignSelf: "center" }}
            />
            <Grid container gap={CSSGap.Small}>
              <Grid item xs={8} md={5}>
                <FileUploader
                  handleChange={handleChange}
                  label={t("review_form_img_preview_ph")}
                />
              </Grid>
              <Grid item xs={8} md={5}>
                <FileUploader
                  handleChange={loadToGallery}
                  label={t("review_form_img_markup_ph")}
                />
              </Grid>
            </Grid>
            <textarea
              rows={15}
              style={{
                backgroundColor: theme === Theme.Light ? "white" : "black",
                color: theme === Theme.Light ? "black" : "white",
              }}
              placeholder={t("review_form_text_ph")}
              {...register("text")}
            />
            <TagsPanelComponent
              tags={tags}
              setTags={setTags}
              compositionTag={composition.tag}
            />
            <Button type="submit" sx={{ alignSelf: "end" }}>
              {t("word_submit")}
            </Button>
          </Stack>
        </form>
        <GalleryComponent images={images} />
      </Stack>
    </Dialog>
  );
};
