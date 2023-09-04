import {CSSProperties, useMemo} from 'react'
import {useMemoObservable} from 'react-rx'
import {
  DefaultPreview,
  getPreviewStateObservable,
  getPreviewValueWithFallback,
  SanityDefaultPreview,
  SanityDocument,
  SchemaType,
  useDocumentPreviewStore,
  useSchema,
} from 'sanity'
import {useIntentLink} from 'sanity/router'
import {Box, Button, ButtonProps, Card} from '@sanity/ui'
import {ErrorOutlineIcon} from '@sanity/icons'

interface ResultPreviewProps {
  documentId: string
  schemaTypeName: string
  button?: boolean
  style?: CSSProperties
}

export function DocumentPreview({
  documentId,
  style,
  schemaTypeName,
  ...buttonProps
}: ResultPreviewProps & ButtonProps) {
  const schema = useSchema()
  const schemaType = schemaTypeName ? schema.get(schemaTypeName) : undefined

  if (!schemaTypeName) {
    return (
      <Card style={{minHeight: '36px'}}>
        <DefaultPreview
          withShadow={false}
          withBorder={false}
          title={'Loading...'}
          schemaType={schemaType}
          isPlaceholder
        />
      </Card>
    )
  }

  if (!schemaType) {
    return (
      <Card>
        <DefaultPreview
          withShadow={false}
          withBorder={false}
          media={() => <ErrorOutlineIcon />}
          title={
            <>
              Unknown type <code>{schemaTypeName ?? 'N/A'}</code> for {documentId}
            </>
          }
        />
      </Card>
    )
  }

  return (
    <DocumentPreviewInner
      documentId={documentId}
      schemaTypeName={schemaTypeName}
      schemaType={schemaType}
      style={style}
      {...buttonProps}
    />
  )
}

function DocumentPreviewInner({
  documentId,
  schemaType,
  style,
  button,
}: ResultPreviewProps & {schemaType: SchemaType} & ButtonProps) {
  const documentPreviewStore = useDocumentPreviewStore()

  // NOTE: this emits sync so can never be null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {draft, published, isLoading} = useMemoObservable(
    () => getPreviewStateObservable(documentPreviewStore, schemaType, documentId, ''),
    [documentId, documentPreviewStore, schemaType],
  )!

  const sanityDocument = useMemo(() => {
    return {
      _id: documentId,
      _type: schemaType?.name,
    } as SanityDocument
  }, [documentId, schemaType?.name])

  const {onClick: onIntentClick, href} = useIntentLink({
    intent: 'edit',
    params: {
      id: documentId,
      type: schemaType?.name,
    },
  })

  const preview = (
    <SanityDefaultPreview
      {...getPreviewValueWithFallback({
        draft,
        published,
        value: sanityDocument,
      })}
      isPlaceholder={isLoading ?? true}
      layout="default"
      icon={schemaType?.icon}
    />
  )
  if (button) {
    return (
      <Button
        as={'a'}
        href={href}
        onClick={onIntentClick}
        mode="ghost"
        style={{width: '100%', ...style}}
      >
        {preview}
      </Button>
    )
  }
  return <Box style={{width: '100%'}}>{preview}</Box>
}
